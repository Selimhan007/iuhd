import { createAPIFileRoute } from "@tanstack/react-start/api";
import { sql } from "drizzle-orm";
import { db } from "@/lib/profile-db";
import { auth } from "@/lib/server-auth";

async function getUserId(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) throw new Response("Unauthorized", { status: 401 });
  return session.user.id;
}

export const APIRoute = createAPIFileRoute("/api/profile")({
  GET: async ({ request }) => {
    try {
      const userId = await getUserId(request);
      const result = await db.execute(sql`
        SELECT "userId", role, "studentCode", phone, university, faculty, department,
          program, "groupName", year, "avatarUrl", bio
        FROM profiles WHERE "userId" = ${userId} LIMIT 1
      `);
      return Response.json(result.rows[0] ?? null);
    } catch (error) {
      if (error instanceof Response) return error;
      return Response.json({ error: "Unable to load profile" }, { status: 500 });
    }
  },
  PATCH: async ({ request }) => {
    try {
      const userId = await getUserId(request);
      const body = (await request.json()) as Record<string, unknown>;
      const allowed = ["phone", "university", "faculty", "department", "program", "groupName", "year", "avatarUrl", "bio"] as const;
      const values = Object.fromEntries(allowed.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));
      const result = await db.execute(sql`
        INSERT INTO profiles (id, "userId", phone, university, faculty, department, program, "groupName", year, "avatarUrl", bio)
        VALUES (${crypto.randomUUID()}, ${userId}, ${values["phone"] ?? null}, ${values["university"] ?? null}, ${values["faculty"] ?? null}, ${values["department"] ?? null}, ${values["program"] ?? null}, ${values["groupName"] ?? null}, ${values["year"] ?? null}, ${values["avatarUrl"] ?? null}, ${values["bio"] ?? null})
        ON CONFLICT ("userId") DO UPDATE SET
          phone = COALESCE(EXCLUDED.phone, profiles.phone), university = COALESCE(EXCLUDED.university, profiles.university),
          faculty = COALESCE(EXCLUDED.faculty, profiles.faculty), department = COALESCE(EXCLUDED.department, profiles.department),
          program = COALESCE(EXCLUDED.program, profiles.program), "groupName" = COALESCE(EXCLUDED."groupName", profiles."groupName"),
          year = COALESCE(EXCLUDED.year, profiles.year), "avatarUrl" = COALESCE(EXCLUDED."avatarUrl", profiles."avatarUrl"),
          bio = COALESCE(EXCLUDED.bio, profiles.bio), "updatedAt" = now()
        RETURNING "userId", role, "studentCode", phone, university, faculty, department, program, "groupName", year, "avatarUrl", bio
      `);
      return Response.json(result.rows[0]);
    } catch (error) {
      if (error instanceof Response) return error;
      return Response.json({ error: "Unable to save profile" }, { status: 500 });
    }
  },
});

export default APIRoute;
