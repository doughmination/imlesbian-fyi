import Link from "next/link";
import { SiteHeader } from "@/app/components/SiteHeader";

const buttonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "0.85rem 1.6rem",
  borderRadius: "999px",
  fontFamily: "var(--font-body)",
  fontWeight: 500,
  fontSize: "0.95rem",
  textDecoration: "none",
};

const cardStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "var(--radius-lg)",
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
};

const features = [
  {
    title: "5 subdomains, on us",
    body: "Claim up to five *.imlesbian.fyi subdomains and point each one wherever you like.",
  },
  {
    title: "Discord-verified",
    body: "Link a subdomain to your Discord profile — we handle hosting the /.well-known/discord file for you.",
  },
  {
    title: "One-click sign in",
    body: "No passwords to manage. Sign in with Discord and you're in.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "5rem",
          padding: "3rem 1.5rem 6rem",
        }}
      >
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.25rem",
            textAlign: "center",
            maxWidth: 640,
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Your tiny queer corner of the internet.
          </h1>
          <p style={{ color: "var(--muted)", maxWidth: 480, margin: 0 }}>
            Claim a free subdomain, point it anywhere, and link it to your
            Discord profile. No hosting, no DNS, no hassle.
          </p>
          <div
            style={{
              display: "flex",
              gap: "0.85rem",
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: "0.5rem",
            }}
          >
            <Link
              href="/login"
              style={{
                ...buttonStyle,
                background: "var(--paper)",
                color: "var(--ink)",
              }}
            >
              Claim your subdomain
            </Link>
            <Link
              href="/docs"
              style={{
                ...buttonStyle,
                background: "transparent",
                color: "var(--paper)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              Read the docs
            </Link>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
            width: "100%",
            maxWidth: 900,
          }}
        >
          {features.map((f) => (
            <div key={f.title} style={cardStyle}>
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontSize: "1.15rem",
                }}
              >
                {f.title}
              </p>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
                {f.body}
              </p>
            </div>
          ))}
        </section>

        <section
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-mono)",
              color: "var(--flag-4)",
              fontSize: "1.1rem",
            }}
          >
            yourname.imlesbian.fyi
          </p>
          <p style={{ margin: 0, color: "var(--muted)", maxWidth: 420 }}>
            Sign in with Discord to see what&apos;s still available.
          </p>
        </section>
      </main>
    </>
  );
}