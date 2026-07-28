export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4071";

export interface Me {
  id: string;
  username: string;
  discordUsername: string;
  discordAvatar: string | null;
  createdAt: string;
}

export interface Subdomain {
  id: string;
  name: string;
  ownerId: string;
  destinationUrl: string;
  active: boolean;
  visitCount: number;
  discordVerificationHash: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MineResponse {
  subdomains: Subdomain[];
  limit: number;
  claimCooldownUntil: string | null;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(data?.error ?? "Something went wrong", res.status);
  }

  return data as T;
}

export function discordLoginUrl(): string {
  return `${API_URL}/auth/discord/login`;
}

export async function getMe(): Promise<Me | null> {
  const data = await request<{ user: Me | null }>("/auth/me");
  return data.user;
}

export async function logout(): Promise<void> {
  await request("/auth/logout", { method: "POST" });
}

export async function getMySubdomains(): Promise<MineResponse> {
  return request<MineResponse>("/subdomains/mine");
}

export async function checkAvailability(
  name: string
): Promise<{ available: boolean; reason?: string }> {
  return request(`/subdomains/check/${encodeURIComponent(name)}`);
}

export async function claimSubdomain(
  name: string,
  destinationUrl: string
): Promise<Subdomain> {
  const data = await request<{ subdomain: Subdomain }>("/subdomains/claim", {
    method: "POST",
    body: JSON.stringify({ name, destinationUrl }),
  });
  return data.subdomain;
}

export async function updateSubdomain(
  id: string,
  patch: { destinationUrl?: string; active?: boolean }
): Promise<Subdomain> {
  const data = await request<{ subdomain: Subdomain }>(
    `/subdomains/mine/${id}`,
    { method: "PATCH", body: JSON.stringify(patch) }
  );
  return data.subdomain;
}

export async function deleteSubdomain(
  id: string
): Promise<{ claimCooldownUntil: string }> {
  return request(`/subdomains/mine/${id}`, { method: "DELETE" });
}

export async function setDiscordVerification(
  id: string,
  hash: string
): Promise<Subdomain> {
  const data = await request<{ subdomain: Subdomain }>(
    `/subdomains/mine/${id}/discord-verification`,
    { method: "PUT", body: JSON.stringify({ hash }) }
  );
  return data.subdomain;
}

export async function clearDiscordVerification(id: string): Promise<Subdomain> {
  const data = await request<{ subdomain: Subdomain }>(
    `/subdomains/mine/${id}/discord-verification`,
    { method: "DELETE" }
  );
  return data.subdomain;
}
