// Temporary in-memory mock. Once the backend/API exists, replace the body
// of these functions with real fetch() calls to the FastAPI service —
// keep the function signatures the same so nothing upstream has to change.

export interface RedirectTarget {
  subdomain: string;
  destinationUrl: string;
  ownerDisplayName: string;
  active: boolean;
}

const MOCK_SUBDOMAINS: Record<string, RedirectTarget> = {
  doughmination: {
    subdomain: "doughmination",
    destinationUrl: "https://doughmination.dev",
    ownerDisplayName: "doughmination",
    active: true,
  },
  alice: {
    subdomain: "alice",
    destinationUrl: "https://github.com/alice",
    ownerDisplayName: "alice",
    active: true,
  },
};

export async function getSubdomainTarget(
  subdomain: string
): Promise<RedirectTarget | null> {
  const normalized = subdomain.toLowerCase();
  return MOCK_SUBDOMAINS[normalized] ?? null;
}

export interface CustomDomainTarget {
  domain: string;
  destinationUrl: string;
  ownerDisplayName: string;
  active: boolean;
}

const MOCK_CUSTOM_DOMAINS: Record<string, CustomDomainTarget> = {};

export async function getCustomDomainTarget(
  domain: string
): Promise<CustomDomainTarget | null> {
  return MOCK_CUSTOM_DOMAINS[domain.toLowerCase()] ?? null;
}
