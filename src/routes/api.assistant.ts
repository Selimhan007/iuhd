import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";

export const Route = createFileRoute("/api/assistant")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { message?: unknown };
        const message = typeof body.message === "string" ? body.message.trim() : "";

        if (!message) {
          return new Response("Message is required", { status: 400 });
        }

        try {
          const result = await generateText({
            model: "openai/gpt-4.1-mini",
            system:
              "You are AI Oquw Komekcisi, a helpful study assistant. Explain concepts clearly, use the user's language, structure answers with short sections, and never invent sources. Keep answers practical for a university student.",
            prompt: message,
          });
          return Response.json({ answer: result.text });
        } catch (error) {
          console.error("[v0] AI assistant request failed", error);
          return Response.json(
            { error: "AI сервис временно недоступен. Владелец проекта должен активировать AI Gateway." },
            { status: 503 },
          );
        }
      },
    },
  },
});
