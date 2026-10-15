import { createFileRoute } from "@tanstack/react-router";
import { sql } from "drizzle-orm";
import { auth, pool } from "@/lib/server-auth";
import { db } from "@/lib/profile-db";

const adminRoles = new Set(["admin", "superadmin"]);

async function requireAdmin(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw new Response("Unauthorized", { status: 401 });
  const result = await db.execute(sql`SELECT role FROM profiles WHERE "userId" = ${session.user.id} LIMIT 1`);
  const role = String(result.rows[0]?.["role"] ?? "");
  if (!adminRoles.has(role)) throw new Response("Forbidden", { status: 403 });
  return { user: session.user, role };
}

function jsonError(error: unknown) {
  if (error instanceof Response) return error;
  return Response.json({ error: "Admin operation failed" }, { status: 500 });
}

export const Route = createFileRoute("/api/admin")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const actor = await requireAdmin(request);
          const url = new URL(request.url);
          const resource = url.searchParams.get("resource") ?? "users";
          if (resource === "content") {
            const content = await db.execute(sql`SELECT id, kind, title, body, date, place, category, audience, important, author_id, created_at FROM admin_content ORDER BY created_at DESC LIMIT 200`);
            return Response.json({ items: content.rows });
          }
          if (resource === "audit") {
            const audit = await db.execute(sql`SELECT id, action, entity_type, entity_id, metadata, created_at FROM admin_audit_log WHERE actor_id = ${actor.user.id} ORDER BY created_at DESC LIMIT 200`);
            return Response.json({ items: audit.rows });
          }
          const users = await db.execute(sql`SELECT u.id, u.name, u.email, u.createdAt, COALESCE(p.role, 'student') AS role, p."studentCode", p.phone, p.university, p.faculty, p.department, p.program, p."groupName", p.year, p.bio FROM "user" u LEFT JOIN profiles p ON p."userId" = u.id ORDER BY u."createdAt" DESC LIMIT 500`);
          return Response.json({ items: users.rows });
        } catch (error) {
          return jsonError(error);
        }
      },
      POST: async ({ request }) => {
        try {
          const actor = await requireAdmin(request);
          const body = (await request.json()) as Record<string, unknown>;
          const action = String(body["action"] ?? "");
          if (action === "create-user") {
            const name = String(body["name"] ?? "").trim();
            const email = String(body["email"] ?? "").trim().toLowerCase();
            const password = String(body["password"] ?? "");
            const role = String(body["role"] ?? "student");
            if (!name || !email || password.length < 8 || !["student", "teacher", "admin", "superadmin"].includes(role)) return Response.json({ error: "Invalid profile data" }, { status: 400 });
            const created = await auth.api.signUpEmail({ body: { name, email, password } });
            const userId = created.user.id;
            await db.execute(sql`INSERT INTO profiles (id, "userId", role, phone, university, faculty, department, program, "groupName", year, bio) VALUES (${crypto.randomUUID()}, ${userId}, ${role}, ${body["phone"] ? String(body["phone"]) : null}, ${body["university"] ? String(body["university"]) : null}, ${body["faculty"] ? String(body["faculty"]) : null}, ${body["department"] ? String(body["department"]) : null}, ${body["program"] ? String(body["program"]) : null}, ${body["groupName"] ? String(body["groupName"]) : null}, ${body["year"] ? String(body["year"]) : null}, ${body["bio"] ? String(body["bio"]) : null}) ON CONFLICT ("userId") DO UPDATE SET role = EXCLUDED.role, phone = EXCLUDED.phone, university = EXCLUDED.university, faculty = EXCLUDED.faculty, department = EXCLUDED.department, program = EXCLUDED.program, "groupName" = EXCLUDED."groupName", year = EXCLUDED.year, bio = EXCLUDED.bio, "updatedAt" = now()`);
            await db.execute(sql`INSERT INTO admin_audit_log (id, actor_id, action, entity_type, entity_id, metadata) VALUES (${crypto.randomUUID()}, ${actor.user.id}, 'create', 'user', ${userId}, ${JSON.stringify({ email, role })}::jsonb)`);
            return Response.json({ id: userId, name, email, role }, { status: 201 });
          }
          if (action === "publish-content") {
            const kind = String(body["kind"] ?? "announcement");
            const title = String(body["title"] ?? "").trim();
            const contentBody = String(body["body"] ?? "").trim();
            if (!["announcement", "event", "notification"].includes(kind) || !title || !contentBody) return Response.json({ error: "Title and message are required" }, { status: 400 });
            const id = crypto.randomUUID();
            await db.execute(sql`INSERT INTO admin_content (id, kind, title, body, date, place, category, audience, important, author_id) VALUES (${id}, ${kind}, ${title}, ${contentBody}, ${body["date"] ? String(body["date"]) : new Date().toISOString().slice(0, 10)}, ${body["place"] ? String(body["place"]) : null}, ${body["category"] ? String(body["category"]) : "university"}, ${body["audience"] ? String(body["audience"]) : "all"}, ${Boolean(body["important"])}, ${actor.user.id})`);
            await db.execute(sql`INSERT INTO admin_audit_log (id, actor_id, action, entity_type, entity_id, metadata) VALUES (${crypto.randomUUID()}, ${actor.user.id}, 'publish', 'content', ${id}, ${JSON.stringify({ kind, audience: body["audience"] ?? "all" })}::jsonb)`);
            return Response.json({ id, kind, title, body: contentBody }, { status: 201 });
          }
          return Response.json({ error: "Unknown admin action" }, { status: 400 });
        } catch (error) {
          return jsonError(error);
        }
      },
      DELETE: async ({ request }) => {
        try {
          const actor = await requireAdmin(request);
          const id = new URL(request.url).searchParams.get("id");
          if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
          await db.execute(sql`DELETE FROM admin_content WHERE id = ${id}`);
          await db.execute(sql`INSERT INTO admin_audit_log (id, actor_id, action, entity_type, entity_id) VALUES (${crypto.randomUUID()}, ${actor.user.id}, 'delete', 'content', ${id})`);
          return new Response(null, { status: 204 });
        } catch (error) {
          return jsonError(error);
        }
      },
    },
  },
});

export default Route;

void pool;
