import { NextRequest, NextResponse } from "next/server";

// The bare domain(s) that should render the marketing homepage, not a
// user's redirect page. Keep this in sync with what nginx forwards.
const ROOT_HOSTS = new Set(["imlesbian.fyi", "www.imlesbian.fyi", "localhost:3000"]);

// Reserved words that can never be claimed as a subdomain, so they don't
// collide with real app routes (app, api, docs, etc.)
const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "api",
  "docs",
  "admin",
  "static",
  "cdn",
  "mail",
]);

function extractSubdomain(host: string): string | null {
  // Strip port for local dev (e.g. "alice.localhost:3000")
  const hostname = host.split(":")[0];

  if (ROOT_HOSTS.has(host) || ROOT_HOSTS.has(hostname)) return null;

  // Local dev: alice.localhost
  if (hostname.endsWith(".localhost")) {
    const sub = hostname.replace(".localhost", "");
    return sub || null;
  }

  // Production: alice.imlesbian.fyi
  if (hostname.endsWith(".imlesbian.fyi")) {
    const sub = hostname.replace(".imlesbian.fyi", "");
    return sub || null;
  }

  // Anything else isn't a *.imlesbian.fyi host — custom domains aren't
  // supported yet (no backend route for them), so let it fall through to
  // the normal 404 rather than pretending to resolve it.
  return null;
}

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const subdomain = extractSubdomain(host);

  // Root domain — let it fall through to the normal app routes (homepage,
  // dashboard, docs, etc.)
  if (subdomain === null) {
    return NextResponse.next();
  }

  if (RESERVED_SUBDOMAINS.has(subdomain)) {
    // Someone pointed a reserved word at the wildcard — bounce to the
    // homepage rather than trying to resolve it as a user redirect.
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.hostname = "imlesbian.fyi";
    return NextResponse.redirect(url);
  }

  // Discord's linked-role domain verification fetches this exact path and
  // expects a plain-text `dh={hash}` body — keep it separate from the
  // redirect page rather than trying to cram it into /r/[subdomain].
  if (request.nextUrl.pathname === "/.well-known/discord") {
    const url = request.nextUrl.clone();
    url.pathname = `/r/${subdomain}/well-known-discord`;
    return NextResponse.rewrite(url);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/r/${subdomain}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico and other static assets in /public
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};