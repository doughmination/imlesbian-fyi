import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./session";

export type AuthedUser = typeof users.$inferSelect;

declare module "hono" {
  interface ContextVariableMap {
    user: AuthedUser | null;
  }
}

// Attaches the current user (or null) to context — does NOT reject the
// request. Use `requireAuth` for routes that must be logged in.
export const attachUser = createMiddleware(async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE_NAME);
  if (!token) {
    c.set("user", null);
    return next();
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    c.set("user", null);
    return next();
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.userId))
    .limit(1);

  c.set("user", user ?? null);
  return next();
});

export const requireAuth = createMiddleware(async (c, next) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Not authenticated" }, 401);
  }
  return next();
});
