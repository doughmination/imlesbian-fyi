"use client";

import { useEffect, useState } from "react";

const COUNTDOWN_SECONDS = 3;

function hostnameOnly(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function RedirectCard({
  label,
  destinationUrl,
}: {
  label: string;
  destinationUrl: string;
}) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) {
      window.location.href = destinationUrl;
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, destinationUrl]);

  const progress = 1 - secondsLeft / COUNTDOWN_SECONDS;

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div
        aria-hidden
        style={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          padding: 4,
          background: `conic-gradient(from -90deg, var(--flag-1), var(--flag-2), var(--flag-3), var(--flag-4), var(--flag-5) ${
            progress * 360
          }deg, rgba(255,255,255,0.12) ${progress * 360}deg)`,
          transition: "background 1s linear",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "var(--ink)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-mono)",
            fontSize: "1.75rem",
          }}
        >
          {secondsLeft}
        </div>
      </div>

      <div style={{ maxWidth: 480 }}>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
            margin: "0 0 0.75rem",
          }}
        >
          Redirecting you to
        </p>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "1.1rem",
            color: "var(--flag-4)",
            wordBreak: "break-word",
            margin: 0,
          }}
        >
          {hostnameOnly(destinationUrl)}
        </p>
      </div>

      <a
        href={destinationUrl}
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.9rem",
          color: "var(--muted)",
          textDecoration: "underline",
        }}
      >
        Not redirecting? Click here — {label} sent you.
      </a>
    </main>
  );
}
