import { put } from "@vercel/blob";
import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute("/api/upload")({
  POST: async ({ request }: { request: Request }) => {
    try {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!(file instanceof File)) {
        return Response.json({ error: "No file provided." }, { status: 400 });
      }
      if (file.size > 25 * 1024 * 1024) {
        return Response.json({ error: "File is larger than 25 MB." }, { status: 413 });
      }
      const blob = await put(`lectures/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`, file, {
        access: "private",
        addRandomSuffix: false,
      });
      return Response.json({ pathname: blob.pathname, filename: file.name, size: file.size });
    } catch (error) {
      console.error("[v0] Blob upload failed", error);
      return Response.json({ error: "Upload failed." }, { status: 500 });
    }
  },
});

export default APIRoute;
