import { betterAuth } from "better-auth";
import { pool } from "./db";

const origins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:8085",
  "http://localhost:8086",
  ...(process.env["NODE_ENV"] === "development"
    ? [
        "https://sb-3ls14v7k6ynh.vercel.run",
        "https://sb-6ltkcf4gwz69.vercel.run",
        "https://neon-database-user-configuration-18x.v0.build",
        "https://neon-database-user-configuration-5id.v0.build",
        "https://neon-database-user-configuration-rhv.v0.build",
      ]
    : []),
  process.env["V0_RUNTIME_URL"],
  process.env["V0_DEV_APP_URL"],
  process.env["V0_BUILD_URL"],
  process.env["V0_SANDBOX_URL"],
  process.env["VITE_NEON_AUTH_URL"]
    ? new URL(process.env["VITE_NEON_AUTH_URL"]).origin
    : undefined,
  process.env["NEON_AUTH_BASE_URL"]
    ? new URL(process.env["NEON_AUTH_BASE_URL"]).origin
    : undefined,
  process.env["VERCEL_URL"] ? `https://${process.env["VERCEL_URL"]}` : undefined,
  process.env["VERCEL_PROJECT_PRODUCTION_URL"]
    ? `https://${process.env["VERCEL_PROJECT_PRODUCTION_URL"]}`
    : undefined,
].filter((origin): origin is string => Boolean(origin));

const baseURL =
  process.env["BETTER_AUTH_URL"] ??
  (process.env["VERCEL_PROJECT_PRODUCTION_URL"]
    ? `https://${process.env["VERCEL_PROJECT_PRODUCTION_URL"]}`
    : undefined) ??
  (process.env["VERCEL_URL"] ? `https://${process.env["VERCEL_URL"]}` : undefined) ??
  process.env["V0_RUNTIME_URL"];

export const auth = betterAuth({
  database: pool,
  ...(baseURL ? { baseURL } : {}),
  trustedOrigins: async (request?: Request) => {
    const requestOrigin = request?.headers.get("origin");
    const requestHost = request?.headers.get("host");

    if (requestOrigin && requestHost) {
      try {
        if (new URL(requestOrigin).host === requestHost) {
          return [...origins, requestOrigin];
        }
      } catch {
        // Let Better Auth reject malformed origins.
      }
    }

    return origins;
  },
  emailAndPassword: {
    enabled: true,
  },
  ...(process.env["NODE_ENV"] === "development"
    ? {
        advanced: {
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
          },
        },
      }
    : {}),
});

export type Auth = typeof auth;
