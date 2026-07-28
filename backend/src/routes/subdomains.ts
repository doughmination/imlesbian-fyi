import { Hono } from "hono";
import { eq, and, count } from "drizzle-orm";
import { db } from "@/db/client";
import { subdomains, users } from "@/db/schema";
import { requireAuth } from "@/auth/middleware";
import { isAdmin } from "@/lib/admin";
import {
  claimSubdomainSchema,
  adminClaimSubdomainSchema,
  updateSubdomainSchema,
  subdomainNameSchema,
  discordVerificationHashSchema,
  MAX_SUBDOMAINS_PER_USER,
  CLAIM_COOLDOWN_DAYS,
} from "@/lib/validation";

export const subdomainRoutes = new Hono();

// --- Public: used by the Next.js redirect page (server-side fetch) ---
subdomainRoutes.get("/lookup/:name", async (c) => {
  const name = c.req.param("name").toLowerCase();

  const [target] = await db
    .select()
    .from(subdomains)
    .where(eq(subdomains.name, name))
    .limit(1);

  if (!target || !target.active) {
    return c.json({ error: "Not found" }, 404);
  }

  // Fire-and-forget visit counter — don't block the redirect on this.
  db.update(subdomains)
    .set({ visitCount: target.visitCount + 1 })
    .where(eq(subdomains.id, target.id))
    .catch((err) => console.error("Failed to increment visit count:", err));

  return c.json({
    subdomain: target.name,
    destinationUrl: target.destinationUrl,
    active: target.active,
  });
});

// --- Public: availability check for the claim form ---
subdomainRoutes.get("/check/:name", async (c) => {
  const parsed = subdomainNameSchema.safeParse(
    c.req.param("name").toLowerCase()
  );

  if (!parsed.success) {
    return c.json({
      available: false,
      reason: parsed.error.issues[0]?.message ?? "Invalid name",
    });
  }

  const [existing] = await db
    .select({ id: subdomains.id })
    .from(subdomains)
    .where(eq(subdomains.name, parsed.data))
    .limit(1);

  return c.json({ available: !existing });
});

// --- Public: Discord linked-role domain verification file.
// Discord's "linked domain" check fetches
// https://{name}.imlesbian.fyi/.well-known/discord and expects a body of
// `dh={hash}`. The Next.js proxy rewrites that path here.
subdomainRoutes.get("/verify/:name", async (c) => {
  const name = c.req.param("name").toLowerCase();

  const [target] = await db
    .select({
      active: subdomains.active,
      hash: subdomains.discordVerificationHash,
    })
    .from(subdomains)
    .where(eq(subdomains.name, name))
    .limit(1);

  if (!target || !target.active || !target.hash) {
    return c.text("Not found", 404);
  }

  return c.text(`dh=${target.hash}`);
});

// --- Authed: everything below requires a session ---

subdomainRoutes.get("/mine", requireAuth, async (c) => {
  const user = c.get("user")!;
  const admin = isAdmin(user);
  const mine = await db
    .select()
    .from(subdomains)
    .where(eq(subdomains.ownerId, user.id));

  return c.json({
    subdomains: mine,
    limit: admin ? null : MAX_SUBDOMAINS_PER_USER,
    claimCooldownUntil: admin ? null : user.subdomainClaimCooldownUntil,
    isAdmin: admin,
  });
});

subdomainRoutes.post("/claim", requireAuth, async (c) => {
  const user = c.get("user")!;
  const admin = isAdmin(user);
  const body = await c.req.json().catch(() => null);
  const parsed = (admin ? adminClaimSubdomainSchema : claimSubdomainSchema).safeParse(
    body
  );

  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message }, 400);
  }

  if (
    !admin &&
    user.subdomainClaimCooldownUntil &&
    user.subdomainClaimCooldownUntil.getTime() > Date.now()
  ) {
    return c.json(
      {
        error: "You're on a claim cooldown after deleting a subdomain",
        claimCooldownUntil: user.subdomainClaimCooldownUntil,
      },
      403
    );
  }

  if (!admin) {
    const [{ value: ownedCount }] = await db
      .select({ value: count() })
      .from(subdomains)
      .where(eq(subdomains.ownerId, user.id));

    if (ownedCount >= MAX_SUBDOMAINS_PER_USER) {
      return c.json(
        { error: `You can only claim up to ${MAX_SUBDOMAINS_PER_USER} subdomains` },
        403
      );
    }
  }

  const { name, destinationUrl } = parsed.data;

  const [existing] = await db
    .select({ id: subdomains.id })
    .from(subdomains)
    .where(eq(subdomains.name, name))
    .limit(1);

  if (existing) {
    return c.json({ error: "That subdomain is already claimed" }, 409);
  }

  const [created] = await db
    .insert(subdomains)
    .values({
      name,
      ownerId: user.id,
      destinationUrl,
    })
    .returning();

  return c.json({ subdomain: created }, 201);
});

subdomainRoutes.patch("/mine/:id", requireAuth, async (c) => {
  const user = c.get("user")!;
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const parsed = updateSubdomainSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message }, 400);
  }

  const [updated] = await db
    .update(subdomains)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(subdomains.id, id), eq(subdomains.ownerId, user.id)))
    .returning();

  if (!updated) {
    return c.json({ error: "Not found" }, 404);
  }

  return c.json({ subdomain: updated });
});

// Set/replace the Discord linked-role verification hash. This is what
// gets served (as `dh={hash}`) at /.well-known/discord on the subdomain.
subdomainRoutes.put("/mine/:id/discord-verification", requireAuth, async (c) => {
  const user = c.get("user")!;
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const parsed = discordVerificationHashSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message }, 400);
  }

  const [updated] = await db
    .update(subdomains)
    .set({ discordVerificationHash: parsed.data.hash, updatedAt: new Date() })
    .where(and(eq(subdomains.id, id), eq(subdomains.ownerId, user.id)))
    .returning();

  if (!updated) {
    return c.json({ error: "Not found" }, 404);
  }

  return c.json({ subdomain: updated });
});

subdomainRoutes.delete("/mine/:id/discord-verification", requireAuth, async (c) => {
  const user = c.get("user")!;
  const id = c.req.param("id");

  const [updated] = await db
    .update(subdomains)
    .set({ discordVerificationHash: null, updatedAt: new Date() })
    .where(and(eq(subdomains.id, id), eq(subdomains.ownerId, user.id)))
    .returning();

  if (!updated) {
    return c.json({ error: "Not found" }, 404);
  }

  return c.json({ subdomain: updated });
});

// Deleting a subdomain frees the name instantly (nothing soft-deleted —
// the row and any files/verification hash tied to it are gone the moment
// this commits) and starts a 7-day cooldown before this user can claim
// a new one.
subdomainRoutes.delete("/mine/:id", requireAuth, async (c) => {
  const user = c.get("user")!;
  const id = c.req.param("id");

  const [deleted] = await db
    .delete(subdomains)
    .where(and(eq(subdomains.id, id), eq(subdomains.ownerId, user.id)))
    .returning({ id: subdomains.id });

  if (!deleted) {
    return c.json({ error: "Not found" }, 404);
  }

  const cooldownUntil = new Date(
    Date.now() + CLAIM_COOLDOWN_DAYS * 24 * 60 * 60 * 1000
  );

  await db
    .update(users)
    .set({ subdomainClaimCooldownUntil: cooldownUntil })
    .where(eq(users.id, user.id));

  return c.json({ ok: true, claimCooldownUntil: cooldownUntil });
});