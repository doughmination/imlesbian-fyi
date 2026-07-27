export default function Home() {
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
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: "clamp(2rem, 6vw, 3.5rem)",
          margin: 0,
        }}
      >
        Your tiny queer corner of the internet.
      </h1>
      <p style={{ color: "var(--muted)", maxWidth: 480 }}>
        Homepage design is next on the list — this is just a placeholder so
        the root domain has somewhere to land.
      </p>
    </main>
  );
}
