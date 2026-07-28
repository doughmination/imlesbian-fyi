import type { Metadata } from "next";
import { SiteHeader } from "@/app/components/SiteHeader";

export const metadata: Metadata = {
  title: "Terms — imlesbian.fyi",
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
            Terms of Service
          </h1>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            The imlesbian.fyi Terms and Conditions
          </p>
        </div>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>What if I break these?</h2>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Any subdomain found to break our terms of service will be suspended, effective immediately.
            This may also include bans per Discord ID and in worse cases, per IP.
            YOU DO NOT NEED TO BE A LESBIAN TO USE THIS SERVICE!
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Core Values</h2>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            We are committed to fostering an inclusive community where everyone is treated with dignity and respect, regardless of their identity or circumstances.
            This includes, and is not limited to, age, race, ethnicity, gender, gender identity, sexual orientation, religion, disability, or socioeconomic background.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>Eligibility</h2>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            1) You must be at least 13 years old, as per Discord's ToS.
          </p>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            2) Be an individual person, not an organisation, acting either on your own behalf or as a representative of a group or non-commercial project
          </p>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>You may not use this service</h2>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            1) To promote hate speech, witch hunt or other forms of harm.
          </p>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            2) For the selling or advertising of commercial products.
          </p>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            3) To sell, ditribute, adversite or host illegal software and content, including, but not limited to Malware.
          </p>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            4) For degrading the service's performance or availability.
          </p>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            5) To sell, distribute, adversite or host pornography or other sexually explicit material.
          </p>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            6) To adversite or promote any AI generated content, including, but not limited to, AI generated images, text, or other content.
            Note: AI assisted content is allowed, as long as it does not exceed over 45% of your content.
          </p>
        </section>
      </main>
    </>
  );
}
