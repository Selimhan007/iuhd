// @ts-expect-error TanStack Start's generated API export is available in the Vite runtime.
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { randomUUID } from "node:crypto";
import { db } from "../../lib/db";
import { auth } from "../../lib/better-auth";
import { sql } from "drizzle-orm";

async function getSession(request: Request) {
  return auth.api.getSession({ headers: request.headers });
}

export const APIRoute = createAPIFileRoute("/api/content")({
  GET: async ({ request }: { request: Request }) => {
    try {
      const session = await getSession(request);
      if (!session?.user) return Response.json({ error: "Authentication required." }, { status: 401 });
      const posts = await db.execute(sql`SELECT id, author_id, kind, sender_scope, sender_name, title, body, course_id, group_name, due_at, published_at FROM content_posts ORDER BY published_at DESC`);
      return Response.json({ posts: posts.rows });
    } catch (error) {
      console.error("[v0] Content load failed", error);
      return Response.json({ error: "Content is temporarily unavailable." }, { status: 500 });
    }
  },
  POST: async ({ request }: { request: Request }) => {
    try {
      const session = await getSession(request);
      if (!session?.user) return Response.json({ error: "Authentication required." }, { status: 401 });
      const body = await request.json() as Record<string, unknown>;
      const action = typeof body["action"] === "string" ? body["action"] : "publish";
      if (action === "submit") {
        const postId = typeof body["postId"] === "string" ? body["postId"] : "";
        const studentId = session.user.id;
        if (!postId) return Response.json({ error: "Post is required." }, { status: 400 });
        await db.execute(sql`INSERT INTO content_submissions (id, post_id, student_id, file_name, file_url) VALUES (${randomUUID()}, ${postId}, ${studentId}, ${typeof body["fileName"] === "string" ? body["fileName"] : null}, ${typeof body["fileUrl"] === "string" ? body["fileUrl"] : null}) ON CONFLICT (post_id, student_id) DO UPDATE SET file_name = EXCLUDED.file_name, file_url = EXCLUDED.file_url, submitted_at = now()`);
        return Response.json({ ok: true });
      }
      const roleResult = await db.execute(sql`SELECT role FROM "user" WHERE id = ${session.user.id} LIMIT 1`);
      const role = String(roleResult.rows[0]?.["role"] ?? "student");
      if (role !== "teacher" && role !== "admin") return Response.json({ error: "Only staff can publish content." }, { status: 403 });
      const required = ["kind", "title", "body"];
      if (required.some((key) => typeof body[key] !== "string" || !(body[key] as string).trim())) return Response.json({ error: "Required publication fields are missing." }, { status: 400 });
      const id = randomUUID();
      const senderName = session.user.name || session.user.email;
      await db.execute(sql`INSERT INTO content_posts (id, author_id, kind, sender_scope, sender_name, title, body, course_id, group_name, due_at) VALUES (${id}, ${session.user.id}, ${body["kind"]}, ${role}, ${senderName}, ${body["title"]}, ${body["body"]}, ${typeof body["courseId"] === "string" ? body["courseId"] : null}, ${typeof body["groupName"] === "string" ? body["groupName"] : null}, ${typeof body["dueAt"] === "string" && body["dueAt"] ? body["dueAt"] : null})`);
      return Response.json({ post: { id } }, { status: 201 });
    } catch (error) {
      console.error("[v0] Content write failed", error);
      return Response.json({ error: "Content could not be saved." }, { status: 500 });
    }
  },
});

export default APIRoute;
