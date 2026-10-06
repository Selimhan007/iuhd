// @ts-expect-error TanStack Start's generated API export is available in the Vite runtime.
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { generateText } from "ai";

const SYSTEM_PROMPT = `You are okuwçy kömekçisi, a friendly study assistant for students at Student TM. Answer in the user's language when possible. Explain clearly, use short sections and examples, and never invent university-specific facts. If the user asks for homework, guide them step by step instead of only giving an answer.`;

export const APIRoute = createAPIFileRoute("/api/assistant")({
  POST: async ({ request }: { request: Request }) => {
    try {
      const body = (await request.json()) as { message?: unknown };
      const message = typeof body.message === "string" ? body.message.trim() : "";

      if (!message || message.length > 4000) {
        return Response.json({ error: "Message must be between 1 and 4000 characters." }, { status: 400 });
      }

      const result = await generateText({
        model: "openai/gpt-6.1-sol-fast",
        system: SYSTEM_PROMPT,
        prompt: message,
        maxOutputTokens: 700,
      });

      return Response.json({ text: result.text });
    } catch (error) {
      console.error("[v0] Assistant request failed", error);
      return Response.json({ error: "The assistant is temporarily unavailable." }, { status: 500 });
    }
  },
});

export default APIRoute;
