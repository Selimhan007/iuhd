import { betterAuth } from "better-auth";
import { pool } from "./db";

const origins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:8085",
  ...(process.env.NODE_ENV === "development"
    ? [
        "https://*.vercel.run",
        "https://*.v0.build",
      ]
    : []),
  process.env.V0_RUNTIME_URL,
  process.env.V0_DEV_APP_URL,
  process.env.V0_BUILD_URL,
  process.env.V0_SANDBOX_URL,
  process.env.VITE_NEON_AUTH_URL
    ? new URL(process.env.VITE_NEON_AUTH_URL).origin
    : undefined,
  process.env.NEON_AUTH_BASE_URL
    ? new URL(process.env.NEON_AUTH_BASE_URL).origin
    : undefined,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined,
].filter((origin): origin is string => Boolean(origin));

const baseURL = process.env.BETTER_AUTH_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined)
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)
  ?? process.env.V0_RUNTIME_URL;

export const auth = betterAuth({
  database: pool,
  ...(baseURL ? { baseURL } : {}),
  trustedOrigins: origins,
  emailAndPassword: {
    enabled: true,
  },
  ...(process.env.NODE_ENV === "development"
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
