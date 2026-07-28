import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { client } from "./client";

const MIGRATIONS_DIR = path.join(import.meta.dir, "..", "..", "drizzle");

async function ensureMigrationsTable() {
  await client.unsafe(`
    CREATE TABLE IF NOT EXISTS _app_migrations (
      id serial PRIMARY KEY,
      name text NOT NULL UNIQUE,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const rows = await client.unsafe(`SELECT name FROM _app_migrations`);
  return new Set(rows.map((r: { name: string }) => r.name));
}

async function withRetry<T>(
  fn: () => Promise<T>,
  { attempts = 5, delayMs = 2000 } = {}
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      console.warn(
        `  attempt ${i + 1}/${attempts} failed (${(err as Error).message}), retrying in ${delayMs}ms...`
      );
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

async function main() {
  console.log("Running migrations...");

  await withRetry(() => ensureMigrationsTable());
  const applied = await withRetry(() => getAppliedMigrations());

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  skip ${file} (already applied)`);
      continue;
    }

    console.log(`  applying ${file}...`);
    const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf-8");

    // drizzle-kit separates statements with this marker so multi-statement
    // migrations (CREATE TYPE, CREATE TABLE, ALTER TABLE, ...) run as
    // discrete commands rather than one giant multi-statement string.
    const statements = sql
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);

    await withRetry(() =>
      client.begin(async (tx) => {
        for (const statement of statements) {
          await tx.unsafe(statement);
        }
        await tx.unsafe(`INSERT INTO _app_migrations (name) VALUES ($1)`, [
          file,
        ]);
      })
    );

    console.log(`  \u2713 ${file}`);
  }

  console.log("Migrations complete.");
  await client.close();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});