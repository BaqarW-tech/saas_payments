export async function addCollaborator(githubUsername: string) { console.log(`[stub] granting access to ${githubUsername}`); return { status: "pending" as const }; }
export async function removeCollaborator(githubUsername: string) { console.log(`[stub] revoking access from ${githubUsername}`); return { success: true }; }
