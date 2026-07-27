import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { db } from "@/db/client";
import { subdomains } from "@/db/schema";
import { requireAuth } from "@/auth/middleware";
import {
  claimSubdomainSchema,
  updateSubdomainSchema,
  subdomainNameSchema,
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

// --- Authed: everything below requires a session ---

subdomainRoutes.get("/mine", requireAuth, async (c) => {
  const user = c.get("user")!;
  const mine = await db
    .select()
    .from(subdomains)
    .where(eq(subdomains.ownerId, user.id));

  return c.json({ subdomains: mine });
});

subdomainRoutes.post("/claim", requireAuth, async (c) => {
  const user = c.get("user")!;
  const body = await c.req.json().catch(() => null);
  const parsed = claimSubdomainSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message }, 400);
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

  return c.json({ ok: true });
});
