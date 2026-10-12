import { betterAuth } from "better-auth";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env["DATABASE_URL"] });

const originValues = [
  "http://localhost:3000",
  process.env["V0_RUNTIME_URL"],
  process.env["V0_DEV_APP_URL"],
  process.env["V0_BUILD_URL"],
  process.env["V0_SANDBOX_URL"],
  process.env["VERCEL_URL"] ? `https://${process.env["VERCEL_URL"]}` : undefined,
  process.env["VERCEL_PROJECT_PRODUCTION_URL"] ? `https://${process.env["VERCEL_PROJECT_PRODUCTION_URL"]}` : undefined,
].filter((value): value is string => Boolean(value));

export const auth = betterAuth({
  database: pool,
  baseURL: process.env["BETTER_AUTH_URL"] ?? (process.env["VERCEL_PROJECT_PRODUCTION_URL"] ? `https://${process.env["VERCEL_PROJECT_PRODUCTION_URL"]}` : undefined),
  trustedOrigins: originValues,
  emailAndPassword: { enabled: true },
  ...(process.env["NODE_ENV"] === "development"
    ? {
        advanced: {
          defaultCookieAttributes: { sameSite: "none" as const, secure: true },
        },
      }
    : {}),
});

export { pool };
