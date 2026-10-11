import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);

export async function closeDatabase() {
  await pool.end();
}

export type Database = typeof db;

// Keep the pool shared between Better Auth and Drizzle.
export default db;
