import { cookies } from "next/headers";
import { API_URL, type Me } from "@/lib/api";

export async function getServerSession(): Promise<Me | null> {
  const cookieStore = await cookies();
  const header = cookieStore.toString();
  if (!header) return null;

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Cookie: header },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.user ?? null;
  } catch {
    return null;
  }
}