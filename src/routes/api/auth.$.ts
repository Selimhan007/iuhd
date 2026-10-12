import { createAPIFileRoute } from "@tanstack/react-start/api";
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/server-auth";

const handler = toNextJsHandler(auth);

export const APIRoute = createAPIFileRoute("/api/auth/$")({
  ALL: async ({ request }) => {
    const method = request.method.toUpperCase() as keyof typeof handler;
    const routeHandler = handler[method];
    if (!routeHandler) return new Response("Method Not Allowed", { status: 405 });
    return routeHandler(request);
  },
});

export default APIRoute;
