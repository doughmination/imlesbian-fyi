import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/app/components/SiteHeader";
import { DiscordLoginButton } from "./DiscordLoginButton";
import { getServerSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Log in — imlesbian.fyi",
};

export default async function LoginPage() {
  const user = await getServerSession();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <>
      <SiteHeader />
      <main
        style={{
          minHeight: "calc(100dvh - 80px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
            margin: 0,
          }}
        >
          Claim your corner
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: 360, margin: 0 }}>
          Sign in with Discord to claim subdomains, point them wherever you
          like, and link them to your Discord profile.
        </p>
        <DiscordLoginButton />
      </main>
    </>
  );
}