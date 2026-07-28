"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ApiError,
  checkAvailability,
  claimSubdomain,
  clearDiscordVerification,
  deleteSubdomain,
  logout,
  setDiscordVerification,
  updateSubdomain,
  type Me,
  type MineResponse,
  type Subdomain,
} from "@/lib/api";

const cardStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "var(--radius-md)",
  padding: "1.1rem 1.25rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.6rem",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "var(--radius-md)",
  padding: "0.6rem 0.8rem",
  color: "var(--paper)",
  fontFamily: "var(--font-mono)",
  fontSize: "0.9rem",
  width: "100%",
};

const buttonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: "999px",
  padding: "0.5rem 1rem",
  fontFamily: "var(--font-body)",
  fontSize: "0.85rem",
  cursor: "pointer",
};

function formatCooldown(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "now";
  const days = Math.ceil(ms / (24 * 60 * 60 * 1000));
  return `${days} day${days === 1 ? "" : "s"}`;
}

export function DashboardClient({
  user,
  initial,
}: {
  user: Me;
  initial: MineResponse;
}) {
  const [subdomains, setSubdomains] = useState<Subdomain[]>(initial.subdomains);
  const [claimCooldownUntil, setClaimCooldownUntil] = useState(
    initial.claimCooldownUntil
  );
  const limit = initial.limit;

  const onCooldown = useMemo(
    () =>
      !!claimCooldownUntil && new Date(claimCooldownUntil).getTime() > Date.now(),
    [claimCooldownUntil]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {user.discordAvatar && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.discordAvatar}
              alt=""
              width={40}
              height={40}
              style={{ borderRadius: "50%" }}
            />
          )}
          <div>
            <p style={{ margin: 0, fontFamily: "var(--font-body)" }}>
              {user.username}
            </p>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)" }}>
              {subdomains.length}/{limit} subdomains claimed
            </p>
          </div>
        </div>
        <button
          style={{
            ...buttonStyle,
            background: "transparent",
            color: "var(--muted)",
            border: "1px solid rgba(255,255,255,0.16)",
          }}
          onClick={async () => {
            await logout();
            window.location.href = "/";
          }}
        >
          Log out
        </button>
      </div>

      {onCooldown && claimCooldownUntil && (
        <div
          style={{
            ...cardStyle,
            borderColor: "var(--flag-2)",
            color: "var(--flag-2)",
            fontSize: "0.9rem",
          }}
        >
          You deleted a subdomain recently — you can claim a new one in{" "}
          {formatCooldown(claimCooldownUntil)}.
        </div>
      )}

      <ClaimForm
        disabled={onCooldown || subdomains.length >= limit}
        disabledReason={
          onCooldown
            ? "on cooldown"
            : subdomains.length >= limit
              ? "limit reached"
              : undefined
        }
        onClaimed={(sub) => setSubdomains((prev) => [...prev, sub])}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {subdomains.length === 0 && (
          <p style={{ color: "var(--muted)" }}>
            No subdomains yet — claim your first one above.
          </p>
        )}
        {subdomains.map((sub) => (
          <SubdomainCard
            key={sub.id}
            subdomain={sub}
            onUpdated={(updated) =>
              setSubdomains((prev) =>
                prev.map((s) => (s.id === updated.id ? updated : s))
              )
            }
            onDeleted={(id, cooldownUntil) => {
              setSubdomains((prev) => prev.filter((s) => s.id !== id));
              setClaimCooldownUntil(cooldownUntil);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ClaimForm({
  disabled,
  disabledReason,
  onClaimed,
}: {
  disabled: boolean;
  disabledReason?: string;
  onClaimed: (sub: Subdomain) => void;
}) {
  const [name, setName] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [availability, setAvailability] = useState<
    { available: boolean; reason?: string } | null
  >(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) {
      setAvailability(null);
      return;
    }
    setChecking(true);
    const handle = setTimeout(() => {
      checkAvailability(name.toLowerCase())
        .then(setAvailability)
        .finally(() => setChecking(false));
    }, 350);
    return () => clearTimeout(handle);
  }, [name]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const sub = await claimSubdomain(name.toLowerCase(), destinationUrl);
      onClaimed(sub);
      setName("");
      setDestinationUrl("");
      setAvailability(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to claim");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{ ...cardStyle, opacity: disabled ? 0.5 : 1 }}
    >
      <p style={{ margin: 0, fontFamily: "var(--font-display)", fontStyle: "italic" }}>
        Claim a subdomain
      </p>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <input
          style={inputStyle}
          placeholder="yourname"
          value={name}
          disabled={disabled || submitting}
          onChange={(e) => setName(e.target.value.toLowerCase())}
        />
        <span style={{ color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
          .imlesbian.fyi
        </span>
      </div>
      {name && !checking && availability && (
        <p
          style={{
            margin: 0,
            fontSize: "0.8rem",
            color: availability.available ? "#7cd992" : "var(--flag-2)",
          }}
        >
          {availability.available
            ? "available"
            : (availability.reason ?? "taken")}
        </p>
      )}
      <input
        style={inputStyle}
        placeholder="https://where-this-should-go.com"
        value={destinationUrl}
        disabled={disabled || submitting}
        onChange={(e) => setDestinationUrl(e.target.value)}
      />
      {error && (
        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--flag-2)" }}>
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={disabled || submitting || !name || !destinationUrl}
        style={{
          ...buttonStyle,
          background: "var(--paper)",
          color: "var(--ink)",
          alignSelf: "flex-start",
          opacity: disabled || submitting || !name || !destinationUrl ? 0.5 : 1,
        }}
      >
        {disabled ? `Claim (${disabledReason})` : submitting ? "Claiming…" : "Claim"}
      </button>
    </form>
  );
}

function SubdomainCard({
  subdomain,
  onUpdated,
  onDeleted,
}: {
  subdomain: Subdomain;
  onUpdated: (sub: Subdomain) => void;
  onDeleted: (id: string, cooldownUntil: string) => void;
}) {
  const [destinationUrl, setDestinationUrl] = useState(subdomain.destinationUrl);
  const [savingUrl, setSavingUrl] = useState(false);
  const [hashInput, setHashInput] = useState(subdomain.discordVerificationHash ?? "");
  const [savingHash, setSavingHash] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveUrl() {
    if (destinationUrl === subdomain.destinationUrl) return;
    setSavingUrl(true);
    setError(null);
    try {
      const updated = await updateSubdomain(subdomain.id, { destinationUrl });
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update");
    } finally {
      setSavingUrl(false);
    }
  }

  async function saveHash() {
    setSavingHash(true);
    setError(null);
    try {
      const updated = hashInput.trim()
        ? await setDiscordVerification(subdomain.id, hashInput.trim())
        : await clearDiscordVerification(subdomain.id);
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update");
    } finally {
      setSavingHash(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const { claimCooldownUntil } = await deleteSubdomain(subdomain.id);
      onDeleted(subdomain.id, claimCooldownUntil);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete");
      setDeleting(false);
    }
  }

  return (
    <div style={cardStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <a
          href={`https://${subdomain.name}.imlesbian.fyi`}
          target="_blank"
          rel="noreferrer"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "1rem",
            color: "var(--flag-4)",
            textDecoration: "none",
          }}
        >
          {subdomain.name}.imlesbian.fyi
        </a>
        <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
          {subdomain.visitCount} visits
        </span>
      </div>

      <label style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
        Redirects to
      </label>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          style={inputStyle}
          value={destinationUrl}
          onChange={(e) => setDestinationUrl(e.target.value)}
          onBlur={saveUrl}
        />
        {savingUrl && (
          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>saving…</span>
        )}
      </div>

      <label style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.4rem" }}>
        Discord verification hash (from Discord&apos;s linked-role setup)
      </label>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          style={inputStyle}
          placeholder="paste the hash Discord gives you"
          value={hashInput}
          onChange={(e) => setHashInput(e.target.value)}
        />
        <button
          onClick={saveHash}
          disabled={savingHash}
          style={{
            ...buttonStyle,
            background: "transparent",
            color: "var(--paper)",
            border: "1px solid rgba(255,255,255,0.2)",
            whiteSpace: "nowrap",
          }}
        >
          {savingHash ? "…" : hashInput.trim() ? "Save" : "Clear"}
        </button>
      </div>
      {subdomain.discordVerificationHash && (
        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--muted)" }}>
          Serving at {subdomain.name}.imlesbian.fyi/.well-known/discord
        </p>
      )}

      {error && (
        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--flag-2)" }}>
          {error}
        </p>
      )}

      <div style={{ marginTop: "0.4rem" }}>
        {!confirmingDelete ? (
          <button
            onClick={() => setConfirmingDelete(true)}
            style={{
              ...buttonStyle,
              background: "transparent",
              color: "var(--flag-2)",
              border: "1px solid var(--flag-2)",
            }}
          >
            Delete
          </button>
        ) : (
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
              Deletes instantly and locks a new claim for 7 days — sure?
            </span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{ ...buttonStyle, background: "var(--flag-2)", color: "var(--ink)" }}
            >
              {deleting ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              onClick={() => setConfirmingDelete(false)}
              style={{
                ...buttonStyle,
                background: "transparent",
                color: "var(--muted)",
                border: "1px solid rgba(255,255,255,0.16)",
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
