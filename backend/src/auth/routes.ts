import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import {
  buildDiscordAuthorizeUrl,
  exchangeCodeForToken,
  fetchDiscordUser,
  discordAvatarUrl,
} from "./discord";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "./session";
import type { AuthedUser } from "./middleware";

const OAUTH_STATE_COOKIE = "imlesbian_oauth_state";
const isProd = process.env.NODE_ENV === "production";

export const authRoutes = new Hono();

authRoutes.get("/discord/login", (c) => {
  const state = crypto.randomUUID();

  setCookie(c, OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: isProd,
    sameSite: "Lax",
    maxAge: 60 * 10, // 10 minutes — just needs to survive the redirect round trip
    path: "/",
  });

  return c.redirect(buildDiscordAuthorizeUrl(state));
});

authRoutes.get("/discord/callback", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");
  const expectedState = getCookie(c, OAUTH_STATE_COOKIE);

  deleteCookie(c, OAUTH_STATE_COOKIE, { path: "/" });

  if (!code || !state || !expectedState || state !== expectedState) {
    return c.json({ error: "Invalid OAuth state" }, 400);
  }

  const tokenResponse = await exchangeCodeForToken(code);
  const discordUser = await fetchDiscordUser(tokenResponse.access_token);

  // Upsert: existing user by discord_id, else create one. Username
  // defaults to their Discord username but is meant to be editable later
  // (it's separate from discord_username in the schema on purpose).
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.discordId, discordUser.id))
    .limit(1);

  let user: AuthedUser;

  if (existing) {
    [user] = await db
      .update(users)
      .set({
        discordUsername: discordUser.username,
        discordAvatar: discordAvatarUrl(discordUser),
      })
      .where(eq(users.id, existing.id))
      .returning();
  } else {
    [user] = await db
      .insert(users)
      .values({
        discordId: discordUser.id,
        discordUsername: discordUser.username,
        discordAvatar: discordAvatarUrl(discordUser),
        username: discordUser.username,
      })
      .returning();
  }

  const sessionToken = await createSessionToken({ userId: user.id });

  setCookie(c, SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "Lax",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });

  const dashboardUrl = process.env.FRONTEND_DASHBOARD_URL ?? "/dashboard";
  return c.redirect(dashboardUrl);
});

authRoutes.post("/logout", (c) => {
  deleteCookie(c, SESSION_COOKIE_NAME, { path: "/" });
  return c.json({ ok: true });
});

authRoutes.get("/me", (c) => {
  const user = c.get("user");
  if (!user) return c.json({ user: null }, 200);

  return c.json({
    user: {
      id: user.id,
      username: user.username,
      discordUsername: user.discordUsername,
      discordAvatar: user.discordAvatar,
      createdAt: user.createdAt,
    },
  });
});
