// Admins are just specific Discord accounts, listed by Discord user ID
// (not our internal uuid) in the ADMIN_DISCORD_IDS env var — comma
// separated if there's more than one, e.g. "123456789012345678,987...".
// No separate role table: this is deliberately simple since it only ever
// needs to gate a couple of claim-flow bypasses.
const adminIds = new Set(
  (process.env.ADMIN_DISCORD_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
);

export function isAdmin(user: { discordId: string }): boolean {
  return adminIds.has(user.discordId);
}