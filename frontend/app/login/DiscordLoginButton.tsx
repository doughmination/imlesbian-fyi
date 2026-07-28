import { discordLoginUrl } from "@/lib/api";

export function DiscordLoginButton() {
  return (
    <a
      href={discordLoginUrl()}
      className="discord-login-button"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.6rem",
        padding: "0.85rem 1.5rem",
        borderRadius: "999px",
        background: "var(--paper)",
        color: "var(--ink)",
        fontFamily: "var(--font-body)",
        fontWeight: 500,
        fontSize: "0.95rem",
        textDecoration: "none",
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M20.317 4.369A19.79 19.79 0 0 0 15.885 3c-.211.375-.444.87-.608 1.262a18.27 18.27 0 0 0-5.487 0A12.6 12.6 0 0 0 9.182 3a19.74 19.74 0 0 0-4.435 1.37C1.578 9.046.838 13.58 1.207 18.057a19.9 19.9 0 0 0 5.993 3.03c.483-.66.913-1.36 1.283-2.098a12.9 12.9 0 0 1-2.021-.973c.17-.124.336-.253.497-.386 3.898 1.804 8.126 1.804 11.977 0 .163.133.329.262.497.386-.643.383-1.322.71-2.024.974.37.738.8 1.44 1.283 2.098a19.86 19.86 0 0 0 6-3.03c.433-5.19-.744-9.68-3.375-13.688ZM8.02 15.331c-1.171 0-2.13-1.073-2.13-2.393 0-1.319.938-2.393 2.13-2.393 1.203 0 2.15 1.084 2.13 2.393 0 1.32-.938 2.393-2.13 2.393Zm7.96 0c-1.172 0-2.13-1.073-2.13-2.393 0-1.319.938-2.393 2.13-2.393 1.203 0 2.151 1.084 2.13 2.393 0 1.32-.927 2.393-2.13 2.393Z" />
      </svg>
      Continue with Discord
    </a>
  );
}
