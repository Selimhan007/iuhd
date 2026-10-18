import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const connectionString =
  process.env["POSTGRES_URL"] ??
  process.env["POSTGRES_PRISMA_URL"] ??
  process.env["DATABASE_URL"];

if (!connectionString) {
  throw new Error("Missing database connection string");
}

// pg lets sslmode in the URL override the ssl object. Remove it so the
// managed Supabase pooler certificate works consistently in the preview.
const normalizedConnectionString = connectionString
  .replace(/[?&]sslmode=[^&]*/i, "")
  .replace(/[?&]$/, "");

export const pool = new Pool({
  connectionString: normalizedConnectionString,
  // The Vercel preview uses a managed Postgres certificate chain that is not
  // trusted by the sandbox.
  ssl: { rejectUnauthorized: false },
});
export const db = drizzle(pool);

export async function closeDatabase() {
  await pool.end();
}

export type Database = typeof db;

// Keep the pool shared between Better Auth and Drizzle.
export default db;
