import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const connectionString =
  process.env["POSTGRES_URL"] ??
  process.env["POSTGRES_PRISMA_URL"] ??
  process.env["DATABASE_URL"];

if (!connectionString) {
  throw new Error("Missing database connection string");
}

const isDevelopment = process.env["NODE_ENV"] !== "production";
const developmentConnectionString = isDevelopment
  ? connectionString.replace(/[?&]sslmode=[^&]*/i, "").replace(/[?&]$/, "")
  : connectionString;

export const pool = new Pool({
  connectionString: developmentConnectionString,
  // The local Vercel preview uses a managed Postgres certificate chain that is
  // not trusted by the sandbox. Keep certificate verification enabled outside
  // development and only relax it for the preview runtime.
  ...(isDevelopment ? { ssl: { rejectUnauthorized: false } } : {}),
});
export const db = drizzle(pool);

export async function closeDatabase() {
  await pool.end();
}

export type Database = typeof db;

// Keep the pool shared between Better Auth and Drizzle.
export default db;
