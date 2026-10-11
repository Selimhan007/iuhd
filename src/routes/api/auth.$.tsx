// @ts-expect-error TanStack Start's generated API export is available in the Vite runtime.
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { auth } from "../../../lib/better-auth";

async function handle(request: Request) {
  return auth.handler(request);
}

export const APIRoute = createAPIFileRoute("/api/auth/$")({
  GET: ({ request }: { request: Request }) => handle(request),
  POST: ({ request }: { request: Request }) => handle(request),
});

export default APIRoute;
