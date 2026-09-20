# SaaS Payments (Stripe + Inngest + Resend)

A scaffold implementing the full payment lifecycle: checkout → webhook →
durable background processing → refunds → abandoned cart recovery →
transactional email. Based on the durable-execution pattern where webhook
handlers stay thin (validate, enqueue, return) and all real work happens in
checkpointed, retryable steps.

## Running this entirely from an Android phone

You don't need a laptop. This repo has a `.devcontainer` so it boots
straight into a working environment in **GitHub Codespaces**, reachable
from Chrome on Android:

1. Push this folder to a new GitHub repo (or use GitHub's "upload files" in
   the mobile browser if you don't have git set up locally).
2. On that repo's GitHub page (mobile browser is fine), tap **Code → Codespaces → Create codespace on main**.
3. Wait for the container to build — Bun installs automatically via `postCreateCommand`.
4. Open the integrated terminal (or use `gh codespace ssh` from the Codespaces app) and run:
   ```bash
   cp .env.example .env
   # fill in .env with your Neon / Stripe / Resend keys (see below)
   bun install
   bun run db:push
   bun run seed:stripe
   ```
5. Start the app: `bun run dev`
6. Start Inngest's dev server in a second terminal tab: `bun run inngest:dev`
7. Codespaces auto-forwards ports 3000 and 8288 as public HTTPS URLs — tap
   the "Ports" tab to get the public URL for port 3000.

## Wiring up Stripe webhooks without a tunnel

Normally you'd run `stripe listen --forward-to localhost:3000/...` from a
laptop. On Codespaces, skip the tunnel entirely: point Stripe's webhook
directly at your forwarded URL.

1. In the Stripe Dashboard → Developers → Webhooks → Add endpoint.
2. URL: `https://<your-codespace-name>-3000.app.github.dev/api/payments/webhook`
   (copy the exact forwarded URL from the Codespaces "Ports" tab — set that
   port's visibility to **Public** first, or Stripe can't reach it).
3. Select events: `charge.refunded`, `checkout.session.expired`.
4. Copy the signing secret into `.env` as `STRIPE_WEBHOOK_SECRET`.

## Required accounts (all dashboard-only, no local install)

- **Neon** (neon.tech) — free Postgres, gives you `DATABASE_URL`.
- **Stripe** (dashboard.stripe.com) — test mode is fine.
- **Resend** (resend.com) — free tier lets you email your own address without domain verification.

## What's stubbed out

- `src/lib/github.ts` — replace with your real "grant access" logic
  (upgrade a plan flag, issue an API key, unlock content — whatever your
  product sells).
- `src/lib/analytics/server.ts` — wire up PostHog or similar.
- Auth in `/api/purchases/claim` — plug in your real session check; it
  currently expects a `userId` in the request body as a placeholder.

## Testing the flow

```bash
stripe trigger charge.refunded
stripe trigger checkout.session.expired
```

Watch both fire through the Inngest dashboard at the forwarded port-8288 URL.
