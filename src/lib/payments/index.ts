import Stripe from "stripe";

let stripeClient: Stripe | null = null;
function getStripe(): Stripe { if (!stripeClient) { const secretKey = process.env.STRIPE_SECRET_KEY; if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not set"); stripeClient = new Stripe(secretKey); } return stripeClient; }
export const stripe = new Proxy({} as Stripe, { get(_, prop) { return Reflect.get(getStripe(), prop); } });
export async function createOneTimeCheckoutSession(params: { priceId: string; successUrl: string; cancelUrl: string; metadata: Record<string, string>; customerEmail?: string; couponId?: string }) { const client = getStripe(); return client.checkout.sessions.create({ mode: "payment", line_items: [{ price: params.priceId, quantity: 1 }], success_url: params.successUrl, cancel_url: params.cancelUrl, metadata: params.metadata, ...(params.customerEmail && { customer_email: params.customerEmail }), ...(params.couponId ? { discounts: [{ coupon: params.couponId }] } : { allow_promotion_codes: true }) }); }
export async function retrieveCheckoutSession(sessionId: string) { return getStripe().checkout.sessions.retrieve(sessionId); }
export async function constructWebhookEvent(payload: string | Buffer, signature: string) { const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET; if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set"); return getStripe().webhooks.constructEventAsync(payload, signature, webhookSecret); }
