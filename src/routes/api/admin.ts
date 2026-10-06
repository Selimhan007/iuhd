// @ts-expect-error TanStack Start's generated API export is available in the Vite runtime.
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { createAuditEntry, listAdminUsers, saveAdminSetting, updateAdminUserRole } from "../../lib/admin-db";

export const APIRoute = createAPIFileRoute("/api/admin")({
  GET: async () => {
    try {
      return Response.json({ users: await listAdminUsers() });
    } catch (error) {
      console.error("[v0] Admin data load failed", error);
      return Response.json({ error: "Admin data is temporarily unavailable." }, { status: 500 });
    }
  },
  POST: async ({ request }: { request: Request }) => {
    try {
      const body = (await request.json()) as { action?: unknown; userId?: unknown; role?: unknown; key?: unknown; value?: unknown };
      const action = typeof body.action === "string" ? body.action : "";
      if (action === "change-role" && typeof body.userId === "string" && typeof body.role === "string") {
        await updateAdminUserRole(body.userId, body.role);
      } else if (action === "save-setting" && typeof body.key === "string") {
        await saveAdminSetting(body.key, body.value);
      } else if (action) {
        await createAuditEntry(action);
      } else {
        return Response.json({ error: "Action is required." }, { status: 400 });
      }
      return Response.json({ ok: true });
    } catch (error) {
      console.error("[v0] Admin action failed", error);
      return Response.json({ error: "Admin action failed." }, { status: 500 });
    }
  },
});

export default APIRoute;
