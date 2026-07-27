export function NotClaimed({
  subdomain,
  isCustomDomain = false,
}: {
  subdomain: string;
  isCustomDomain?: boolean;
}) {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
          margin: 0,
        }}
      >
        Nobody&apos;s home yet
      </p>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "1rem",
          color: "var(--flag-4)",
          margin: 0,
          wordBreak: "break-word",
        }}
      >
        {isCustomDomain ? subdomain : `${subdomain}.imlesbian.fyi`}
      </p>
      <p style={{ color: "var(--muted)", maxWidth: 420, margin: 0 }}>
        {isCustomDomain
          ? "This domain isn't connected to anyone's link yet."
          : "This subdomain hasn't been claimed. It could be yours."}
      </p>
      <a
        href="https://imlesbian.fyi"
        style={{
          marginTop: "0.5rem",
          fontFamily: "var(--font-body)",
          fontSize: "0.9rem",
          textDecoration: "underline",
        }}
      >
        Claim your own at imlesbian.fyi
      </a>
    </main>
  );
}
