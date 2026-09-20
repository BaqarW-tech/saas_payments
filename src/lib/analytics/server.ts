export async function trackServerEvent(userId: string, event: string, properties: Record<string, unknown>) { console.log(`[analytics] ${event}`, { userId, ...properties }); }
