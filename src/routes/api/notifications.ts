import { createFileRoute } from "@tanstack/react-router";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/server-auth";
import { db } from "@/lib/profile-db";

async function requireUser(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw new Response("Unauthorized", { status: 401 });
  return session.user;
}

export const Route = createFileRoute("/api/notifications")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const user = await requireUser(request);
          const rows = await db.execute(sql`SELECT id, title, body, kind, read_at, created_at FROM notifications WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 100`);
          return Response.json({ items: rows.rows });
        } catch (error) {
          return error instanceof Response ? error : Response.json({ error: "Unable to load notifications" }, { status: 500 });
        }
      },
      PATCH: async ({ request }) => {
        try {
          const user = await requireUser(request);
          const body = (await request.json()) as Record<string, unknown>;
          const id = typeof body["id"] === "string" ? body["id"] : null;
          if (id) await db.execute(sql`UPDATE notifications SET read_at = now() WHERE id = ${id} AND user_id = ${user.id}`);
          else await db.execute(sql`UPDATE notifications SET read_at = now() WHERE user_id = ${user.id} AND read_at IS NULL`);
          return Response.json({ ok: true });
        } catch (error) {
          return error instanceof Response ? error : Response.json({ error: "Unable to update notifications" }, { status: 500 });
        }
      },
    },
  },
});

export default Route;
