// Stand-in for "grant product access." In the original article this invites
// a GitHub collaborator. Swap this out for whatever access-granting means
// for your product: upgrading a plan flag, issuing an API key, unlocking
// course content, etc. Keep the same shape (throws on failure, returns a
// status string on success) so the Inngest step logic doesn't need to change.
export async function addCollaborator(githubUsername: string) {
  // TODO: replace with a real GitHub API call (Octokit) or your own
  // access-granting logic.
  console.log(`[stub] granting access to ${githubUsername}`);
  return { status: "pending" as const };
}

export async function removeCollaborator(githubUsername: string) {
  console.log(`[stub] revoking access from ${githubUsername}`);
  return { success: true };
}
