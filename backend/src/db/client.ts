import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Bun's native Postgres client — no external driver, no libpq.
export const client = new SQL(connectionString);

export const db = drizzle({ client, schema });
