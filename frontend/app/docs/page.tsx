import type { Metadata } from "next";
import { SiteHeader } from "@/app/components/SiteHeader";

export const metadata: Metadata = {
  title: "Docs — imlesbian.fyi",
};

const sectionStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.6rem",
};

const headingStyle: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontStyle: "italic",
  fontSize: "1.3rem",
  margin: "0 0 0.25rem",
};

const codeStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.85rem",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "var(--radius-md)",
  padding: "0.85rem 1rem",
  overflowX: "auto",
  color: "var(--flag-4)",
};

export default function DocsPage() {
  return (
    <>
      <SiteHeader />
      <main
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: "1rem 1.5rem 4rem",
          display: "flex",
          flexDirection: "column",
          gap: "2.5rem",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
              margin: "0 0 0.5rem",
            }}
          >
            Docs
          </h1>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            Everything you need to claim a subdomain and set it up.
          </p>
        </div>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Signing in</h2>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Accounts are Discord-only — there&apos;s no separate password to
            manage. Sign in from the dashboard and you&apos;ll be sent through
            Discord&apos;s OAuth flow; we only ever ask for your Discord user
            ID, username, and avatar.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Claiming a subdomain</h2>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Each account can claim up to <strong>5 subdomains</strong> at
            once, e.g. <code style={{ fontFamily: "var(--font-mono)" }}>yourname.imlesbian.fyi</code>.
            Names are lowercase letters, numbers, and hyphens, 2–63
            characters, and can&apos;t collide with reserved words like{" "}
            <code style={{ fontFamily: "var(--font-mono)" }}>www</code> or{" "}
            <code style={{ fontFamily: "var(--font-mono)" }}>api</code>. Every
            subdomain redirects visitors to a destination URL you set, which
            you can change any time from the dashboard.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Linking a subdomain to your Discord profile</h2>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Discord&apos;s linked-role &quot;domain verification&quot; feature
            lets you prove you own a website by hosting a file at{" "}
            <code style={{ fontFamily: "var(--font-mono)" }}>
              /.well-known/discord
            </code>{" "}
            containing the verification value Discord gives you. We handle
            the hosting for you — just paste the hash into the field on each
            subdomain&apos;s card in the dashboard and we&apos;ll serve it
            automatically.
          </p>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            For example, if you claim{" "}
            <code style={{ fontFamily: "var(--font-mono)" }}>meow</code> and
            set a verification hash, Discord will find it at:
          </p>
          <pre style={codeStyle}>
            https://meow.imlesbian.fyi/.well-known/discord
          </pre>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            which returns a body containing just the hash, formatted the way
            Discord expects:
          </p>
          <pre style={codeStyle}>dh=&lt;the hash Discord gave you&gt;</pre>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Paste in only the hash itself — no{" "}
            <code style={{ fontFamily: "var(--font-mono)" }}>dh=</code>{" "}
            prefix needed, we add that for you. You can update or clear it
            from the same field at any time, and it&apos;s served fresh on
            every request, so changes take effect immediately.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Deleting a subdomain</h2>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Deleting a subdomain is instant and permanent — the name is
            freed up right away for anyone (including you) to claim again
            later, and anything tied to it, including a Discord verification
            hash, is wiped at the same moment.
          </p>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            To keep names from being cycled abusively, deleting a subdomain
            puts a <strong>7-day cooldown</strong> on your account before you
            can claim a new one. This applies to any new claim, not just
            re-claiming the name you released.
          </p>
        </section>
      </main>
    </>
  );
}
