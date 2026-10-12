// @ts-expect-error TanStack Start's generated API export is available in the Vite runtime.
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { randomUUID } from "node:crypto";
import { db } from "../../lib/db";
import { sql } from "drizzle-orm";

export const APIRoute = createAPIFileRoute("/api/content")({
  GET: async () => {
    try {
      const posts = await db.execute(sql`SELECT id, author_id, kind, sender_scope, sender_name, title, body, course_id, group_name, due_at, published_at FROM content_posts ORDER BY published_at DESC`);
      return Response.json({ posts: posts.rows });
    } catch (error) {
      console.error("[v0] Content load failed", error);
      return Response.json({ error: "Content is temporarily unavailable." }, { status: 500 });
    }
  },
  POST: async ({ request }: { request: Request }) => {
    try {
      const body = await request.json() as Record<string, unknown>;
      const action = typeof body["action"] === "string" ? body["action"] : "publish";
      if (action === "submit") {
        const postId = typeof body["postId"] === "string" ? body["postId"] : "";
        const studentId = typeof body["studentId"] === "string" ? body["studentId"] : "";
        if (!postId || !studentId) return Response.json({ error: "Post and student are required." }, { status: 400 });
        await db.execute(sql`INSERT INTO content_submissions (id, post_id, student_id, file_name, file_url) VALUES (${randomUUID()}, ${postId}, ${studentId}, ${typeof body["fileName"] === "string" ? body["fileName"] : null}, ${typeof body["fileUrl"] === "string" ? body["fileUrl"] : null}) ON CONFLICT (post_id, student_id) DO UPDATE SET file_name = EXCLUDED.file_name, file_url = EXCLUDED.file_url, submitted_at = now()`);
        return Response.json({ ok: true });
      }
      const required = ["authorId", "kind", "senderScope", "senderName", "title", "body"];
      if (required.some((key) => typeof body[key] !== "string" || !(body[key] as string).trim())) return Response.json({ error: "Required publication fields are missing." }, { status: 400 });
      const id = randomUUID();
      await db.execute(sql`INSERT INTO content_posts (id, author_id, kind, sender_scope, sender_name, title, body, course_id, group_name, due_at) VALUES (${id}, ${body["authorId"]}, ${body["kind"]}, ${body["senderScope"]}, ${body["senderName"]}, ${body["title"]}, ${body["body"]}, ${typeof body["courseId"] === "string" ? body["courseId"] : null}, ${typeof body["groupName"] === "string" ? body["groupName"] : null}, ${typeof body["dueAt"] === "string" && body["dueAt"] ? body["dueAt"] : null})`);
      return Response.json({ post: { id } }, { status: 201 });
    } catch (error) {
      console.error("[v0] Content write failed", error);
      return Response.json({ error: "Content could not be saved." }, { status: 500 });
    }
  },
});

export default APIRoute;
