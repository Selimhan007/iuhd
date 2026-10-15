import { createFileRoute } from "@tanstack/react-router";
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/server-auth";

const handler = toNextJsHandler(auth);

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handler.GET(request),
      POST: ({ request }) => handler.POST(request),
    },
  },
});

export default Route;
