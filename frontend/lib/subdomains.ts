import { API_URL } from "@/lib/api";

export interface RedirectTarget {
  subdomain: string;
  destinationUrl: string;
  ownerDisplayName: string;
  active: boolean;
}

export async function getSubdomainTarget(
  subdomain: string
): Promise<RedirectTarget | null> {
  const res = await fetch(
    `${API_URL}/subdomains/lookup/${encodeURIComponent(subdomain.toLowerCase())}`,
    // Always hit the backend fresh — this is a redirect target, caching a
    // stale destinationUrl here is exactly the "why is it still going to
    // the old place" bug.
    { cache: "no-store" }
  );

  if (!res.ok) return null;

  const data = await res.json();
  return {
    subdomain: data.subdomain,
    destinationUrl: data.destinationUrl,
    ownerDisplayName: data.subdomain,
    active: data.active,
  };
}

// --- Custom domains ---
// There's no backend support for these yet (schema exists, no route) —
// this intentionally always returns null until that's built, so
// /d/[domain] falls through to the "not claimed" state rather than lying
// about ownership.
export interface CustomDomainTarget {
  domain: string;
  destinationUrl: string;
  ownerDisplayName: string;
  active: boolean;
}

export async function getCustomDomainTarget(
  _domain: string
): Promise<CustomDomainTarget | null> {
  return null;
}