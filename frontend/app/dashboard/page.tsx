import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SiteHeader } from "@/app/components/SiteHeader";
import { DashboardClient } from "./DashboardClient";
import { API_URL, type MineResponse } from "@/lib/api";
import { getServerSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dashboard — imlesbian.fyi",
};

async function fetchWithSession<T>(path: string): Promise<T | null> {
  const cookieStore = await cookies();
  const header = cookieStore.toString();
  if (!header) return null;

  const res = await fetch(`${API_URL}${path}`, {
    headers: { Cookie: header },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function DashboardPage() {
  const user = await getServerSession();

  if (!user) {
    redirect("/login");
  }

  const mine = (await fetchWithSession<MineResponse>("/subdomains/mine")) ?? {
    subdomains: [],
    limit: 5,
    claimCooldownUntil: null,
  };

  return (
    <>
      <SiteHeader />
      <main
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "1rem 1.5rem 4rem",
        }}
      >
        <DashboardClient user={user} initial={mine} />
      </main>
    </>
  );
}