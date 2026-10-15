import { createFileRoute } from "@tanstack/react-router";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/server-auth";
import { db } from "@/lib/profile-db";

export const Route = createFileRoute("/api/content")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.user) return new Response("Unauthorized", { status: 401 });
        const kind = new URL(request.url).searchParams.get("kind");
        const rows = kind
          ? await db.execute(sql`SELECT id, kind, title, body, date, place, category, audience, important, created_at FROM admin_content WHERE kind = ${kind} ORDER BY created_at DESC LIMIT 100`)
          : await db.execute(sql`SELECT id, kind, title, body, date, place, category, audience, important, created_at FROM admin_content ORDER BY created_at DESC LIMIT 100`);
        return Response.json({ items: rows.rows });
      },
    },
  },
});

export default Route;
