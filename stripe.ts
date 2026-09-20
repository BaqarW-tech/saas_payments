import { eq } from "drizzle-orm";
import { createElement } from "react";

import { inngest } from "../client";
import { trackServerEvent } from "@/lib/analytics/server";
import { db, purchases, users } from "@/lib/db";
import {
  sendEmail,
  PurchaseConfirmationEmail,
  AdminPurchaseNotificationEmail,
  RepoAccessGrantedEmail,
  AbandonedCartEmail,
  AccessRevokedEmail,
} from "@/lib/email";
import { addCollaborator, removeCollaborator } from "@/lib/github";

const brandName = "Your App";

// ── Step-by-step post-payment processing ──────────────────────────────
export const handlePurchaseCompleted = inngest.createFunction(
  { id: "purchase-completed", triggers: [{ event: "purchase/completed" }] },
  async ({ event, step }) => {
    const { userId, tier, sessionId } = event.data as {
      userId: string;
      tier: string;
      sessionId: string;
    };

    // Step 1: lookup — cached so retries never re-hit the DB for this
    const { user, purchase } = await step.run("lookup-user-and-purchase", async () => {
      const userResult = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          githubUsername: users.githubUsername,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      const foundUser = userResult[0];
      if (!foundUser) throw new Error(`User not found: ${userId}`);

      const purchaseResult = await db
        .select({
          amount: purchases.amount,
          currency: purchases.currency,
          stripePaymentIntentId: purchases.stripePaymentIntentId,
        })
        .from(purchases)
        .where(eq(purchases.stripeCheckoutSessionId, sessionId))
        .limit(1);

      return {
        user: foundUser,
        purchase: purchaseResult[0] ?? { amount: 0, currency: "usd", stripePaymentIntentId: null },
      };
    });

    // Step 2: analytics — failure here must never block the emails below
    await step.run("track-purchase", async () => {
      try {
        await trackServerEvent(userId, "purchase_completed_server", {
          tier,
          amount_cents: purchase.amount,
          currency: purchase.currency,
          stripe_session_id: sessionId,
        });
      } catch (error) {
        console.error("Failed to track purchase:", error);
      }
    });

    // Step 3: customer confirmation
    await step.run("send-purchase-confirmation", async () => {
      await sendEmail({
        to: user.email,
        subject: `Your ${brandName} purchase is confirmed!`,
        template: createElement(PurchaseConfirmationEmail, {
          amount: purchase.amount,
          currency: purchase.currency,
          customerEmail: user.email,
        }),
      });
    });

    // Step 4: admin notification (guarded — optional in dev)
    await step.run("send-admin-notification", async () => {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) return;

      await sendEmail({
        to: adminEmail,
        subject: `New sale: ${user.email}`,
        template: createElement(AdminPurchaseNotificationEmail, {
          amount: purchase.amount,
          currency: purchase.currency,
          customerEmail: user.email,
          customerName: user.name,
          stripeSessionId: purchase.stripePaymentIntentId ?? sessionId,
        }),
      });
    });

    if (!user.githubUsername) {
      return { success: true, userId, tier, accessGranted: false };
    }

    // Step 5: grant access — most failure-prone step, isolated on its own
    const grantResult = await step.run("grant-access", async () => addCollaborator(user.githubUsername!));

    // Step 6: analytics for access grant
    await step.run("track-access-granted", async () => {
      await trackServerEvent(userId, "access_granted", {
        tier,
        username: user.githubUsername,
        status: grantResult.status,
      });
    });

    // Step 7: persist access state — only after the grant actually succeeded
    await step.run("update-purchase-record", async () => {
      await db
        .update(purchases)
        .set({ githubAccessGranted: true, githubInvitationId: grantResult.status, updatedAt: new Date() })
        .where(eq(purchases.stripeCheckoutSessionId, sessionId));
    });

    // Step 8: access-ready email — only sent once the grant is confirmed
    await step.run("send-access-email", async () => {
      await sendEmail({
        to: user.email,
        subject: `Your ${brandName} access is ready!`,
        template: createElement(RepoAccessGrantedEmail, { repoUrl: "https://github.com/your-org/your-repo" }),
      });
    });

    // Step 9: kick off the follow-up sequence as a separate event chain
    await step.run("schedule-follow-up", async () => {
      const record = await db
        .select({ id: purchases.id })
        .from(purchases)
        .where(eq(purchases.stripeCheckoutSessionId, sessionId))
        .limit(1);

      if (record[0]) {
        await inngest.send({
          name: "purchase/follow-up.scheduled",
          data: { userId, purchaseId: record[0].id, tier },
        });
      }
    });

    return { success: true, userId, tier, accessGranted: true };
  }
);

// ── Follow-up drip sequence, cancellable on refund ─────────────────────
export const handlePurchaseFollowUp = inngest.createFunction(
  {
    id: "purchase-follow-up",
    triggers: [{ event: "purchase/follow-up.scheduled" }],
    cancelOn: [{ event: "purchase/follow-up.cancelled", match: "data.purchaseId" }],
  },
  async ({ step }) => {
    await step.sleep("wait-7-days", "7d");
    await step.run("send-day-7-email", async () => {
      // TODO: send onboarding tips
    });

    await step.sleep("wait-14-days", "7d");
    await step.run("send-day-14-email", async () => {
      // TODO: send feedback request
    });
  }
);

// ── Refund processing: full vs. partial ────────────────────────────────
export const handleRefund = inngest.createFunction(
  { id: "refund-processed", triggers: [{ event: "stripe/charge.refunded" }] },
  async ({ event, step }) => {
    const data = event.data as {
      chargeId: string;
      paymentIntentId: string;
      amountRefunded: number;
      originalAmount: number;
      currency: string;
    };

    const isFullRefund = data.amountRefunded >= data.originalAmount;

    const { user, purchase } = await step.run("lookup-purchase-by-payment-intent", async () => {
      const purchaseResult = await db
        .select({
          id: purchases.id,
          userId: purchases.userId,
          githubAccessGranted: purchases.githubAccessGranted,
        })
        .from(purchases)
        .where(eq(purchases.stripePaymentIntentId, data.paymentIntentId))
        .limit(1);

      const foundPurchase = purchaseResult[0];
      if (!foundPurchase) return { user: null, purchase: null };

      const userResult = await db
        .select({ id: users.id, email: users.email, name: users.name, githubUsername: users.githubUsername })
        .from(users)
        .where(eq(users.id, foundPurchase.userId))
        .limit(1);

      return { user: userResult[0] ?? null, purchase: foundPurchase };
    });

    if (!purchase || !user) {
      return { success: false, reason: "no_matching_purchase" };
    }

    let accessRevoked = false;

    if (isFullRefund && user.githubUsername && purchase.githubAccessGranted) {
      const revokeResult = await step.run("revoke-access", async () => removeCollaborator(user.githubUsername!));
      accessRevoked = revokeResult.success;
    }

    await step.run("update-purchase-status", async () => {
      await db
        .update(purchases)
        .set({
          status: isFullRefund ? "refunded" : "partially_refunded",
          ...(isFullRefund && { githubAccessGranted: false }),
          updatedAt: new Date(),
        })
        .where(eq(purchases.id, purchase.id));
    });

    await step.run("track-refund", async () => {
      try {
        await trackServerEvent(user.id, "refund_processed", {
          charge_id: data.chargeId,
          amount_cents: data.amountRefunded,
          is_full_refund: isFullRefund,
          access_revoked: accessRevoked,
        });
      } catch (error) {
        console.error("Failed to track refund:", error);
      }
    });

    await step.run("notify-customer", async () => {
      if (isFullRefund) {
        await sendEmail({
          to: user.email,
          subject: `Your ${brandName} refund has been processed`,
          template: createElement(AccessRevokedEmail, {
            customerEmail: user.email,
            refundAmount: data.amountRefunded,
            currency: data.currency,
          }),
        });
      }
      // Partial refund email: swap in PartialRefundEmail here if desired.
    });

    if (isFullRefund) {
      await step.run("cancel-follow-up", async () => {
        await inngest.send({
          name: "purchase/follow-up.cancelled",
          data: { purchaseId: purchase.id },
        });
      });
    }

    return { success: true, accessRevoked, isFullRefund, userId: user.id };
  }
);

// ── Abandoned checkout recovery ─────────────────────────────────────────
export const handleCheckoutExpired = inngest.createFunction(
  { id: "checkout-expired", triggers: [{ event: "stripe/checkout.session.expired" }] },
  async ({ event, step }) => {
    const { customerEmail, sessionId } = event.data as {
      customerEmail: string | null;
      sessionId: string;
    };

    if (!customerEmail) {
      return { success: false, reason: "no_email" };
    }

    // Give the customer time to come back on their own before nudging.
    await step.sleep("wait-before-recovery-email", "1h");

    await step.run("send-abandoned-cart-email", async () => {
      const baseUrl = process.env.APP_URL ?? "https://your-app.com";
      await sendEmail({
        to: customerEmail,
        subject: `Your ${brandName} checkout is waiting`,
        template: createElement(AbandonedCartEmail, {
          customerEmail,
          checkoutUrl: `${baseUrl}/pricing`,
        }),
      });
    });

    await step.run("track-abandoned-cart", async () => {
      try {
        await trackServerEvent("anonymous", "abandoned_cart_email_sent", { customerEmail, sessionId });
      } catch (error) {
        console.error("Failed to track abandoned cart:", error);
      }
    });

    return { success: true, customerEmail };
  }
);

export const stripeFunctions = [
  handlePurchaseCompleted,
  handlePurchaseFollowUp,
  handleRefund,
  handleCheckoutExpired,
];
