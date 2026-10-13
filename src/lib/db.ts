import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const connectionString =
  process.env["POSTGRES_URL"] ??
  process.env["POSTGRES_PRISMA_URL"] ??
  process.env["DATABASE_URL"];

if (!connectionString) {
  throw new Error("Missing database connection string");
}

export const pool = new Pool({ connectionString });
export const db = drizzle(pool);

export async function closeDatabase() {
  await pool.end();
}

export type Database = typeof db;

// Keep the pool shared between Better Auth and Drizzle.
export default db;
