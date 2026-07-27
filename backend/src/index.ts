import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { attachUser } from "@/auth/middleware";
import { authRoutes } from "@/auth/routes";
import { subdomainRoutes } from "@/routes/subdomains";
import { rateLimit } from "@/lib/rate-limit";

const app = new Hono();

const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";

app.use(logger());
app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  })
);
app.use(attachUser);

// OAuth + claim endpoints are the main abuse surfaces — rate-limit them
// tighter than general reads.
app.use("/auth/discord/login", rateLimit({ windowMs: 60_000, max: 20, keyPrefix: "oauth" }));
app.use("/subdomains/claim", rateLimit({ windowMs: 60_000, max: 10, keyPrefix: "claim" }));
app.use("/subdomains/check/*", rateLimit({ windowMs: 60_000, max: 60, keyPrefix: "check" }));

app.get("/health", (c) => c.json({ ok: true }));

app.route("/auth", authRoutes);
app.route("/subdomains", subdomainRoutes);

app.notFound((c) => c.json({ error: "Not found" }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

export default {
  port: Number(process.env.PORT ?? 4070),
  fetch: app.fetch,
};
