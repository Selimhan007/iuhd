import { betterAuth } from "better-auth";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env["DATABASE_URL"] });

const localOrigins = [3000, 8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087, 8088, 8089, 8090].map((port) => `http://localhost:${port}`);
const originValues = [
  ...localOrigins,
  "http://localhost:*",
  "https://*.v0.build",
  "https://*.vercel.run",
  process.env["V0_RUNTIME_URL"],
  process.env["V0_DEV_APP_URL"],
  process.env["V0_BUILD_URL"],
  process.env["V0_SANDBOX_URL"],
  process.env["VERCEL_URL"] ? `https://${process.env["VERCEL_URL"]}` : undefined,
  process.env["VERCEL_PROJECT_PRODUCTION_URL"] ? `https://${process.env["VERCEL_PROJECT_PRODUCTION_URL"]}` : undefined,
].filter((value): value is string => Boolean(value));

const isDevelopment = process.env["NODE_ENV"] === "development";
const baseURL = process.env["BETTER_AUTH_URL"] ?? (isDevelopment ? process.env["V0_RUNTIME_URL"] ?? "http://localhost:3000" : process.env["VERCEL_PROJECT_PRODUCTION_URL"] ? `https://${process.env["VERCEL_PROJECT_PRODUCTION_URL"]}` : process.env["VERCEL_URL"] ? `https://${process.env["VERCEL_URL"]}` : undefined);

export const auth = betterAuth({
  database: pool,
  baseURL,
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
