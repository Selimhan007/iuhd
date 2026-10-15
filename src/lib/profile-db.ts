import { drizzle } from "drizzle-orm/node-postgres";
import { pool } from "@/lib/server-auth";

export const db = drizzle(pool);
