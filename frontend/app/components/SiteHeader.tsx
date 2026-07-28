import Link from "next/link";
import { getServerSession } from "@/lib/session";

export async function SiteHeader() {
  const user = await getServerSession();

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1.25rem 1.5rem",
        maxWidth: 720,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: "1.1rem",
          textDecoration: "none",
        }}
      >
        imlesbian.fyi
      </Link>
      <nav
        style={{
          display: "flex",
          gap: "1.25rem",
          fontSize: "0.9rem",
          fontFamily: "var(--font-body)",
        }}
      >
        <Link href="/docs" style={{ textDecoration: "none", color: "var(--muted)" }}>
          docs
        </Link>
        {user ? (
          <Link
            href="/dashboard"
            style={{ textDecoration: "none", color: "var(--muted)" }}
          >
            dashboard
          </Link>
        ) : (
          <Link
            href="/login"
            style={{ textDecoration: "none", color: "var(--paper)" }}
          >
            log in
          </Link>
        )}
      </nav>
    </header>
  );
}