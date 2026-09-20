// Stub — wire up PostHog, Mixpanel, etc. Wrapped in try/catch by callers so
// analytics failures never block the payment flow.
export async function trackServerEvent(
  userId: string,
  event: string,
  properties: Record<string, unknown>
) {
  console.log(`[analytics] ${event}`, { userId, ...properties });
}
