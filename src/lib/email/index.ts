export { default as PurchaseConfirmationEmail } from "./purchase-confirmation";
export { default as AdminPurchaseNotificationEmail } from "./admin-purchase-notification";
export { default as RepoAccessGrantedEmail } from "./repo-access-granted";
export { default as AbandonedCartEmail } from "./abandoned-cart";
export { default as AccessRevokedEmail } from "./access-revoked";
export { default as PartialRefundEmail } from "./partial-refund";

export async function sendEmail(params: { to: string; subject: string; template: unknown }) {
  console.log(`[email] ${params.subject}`, { to: params.to });
}
