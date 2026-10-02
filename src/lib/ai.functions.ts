import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type AiMode = "chat" | "explain" | "summarize" | "quiz" | "exam" | "translate" | "plan";

const MODE_PROMPTS: Record<AiMode, string> = {
  chat: "You are a helpful study assistant for university students.",
  explain:
    "Explain the topic clearly and simply, like a patient teacher. Use short paragraphs, examples and, where useful, a step-by-step breakdown.",
  summarize:
    "Summarize the provided text or topic into a concise, well-structured summary with key points and bullet lists.",
  quiz:
    "Generate a quiz on the topic: 5 multiple-choice questions (A-D), then an answer key with short explanations at the end.",
  exam:
    "Help the student prepare for an exam on this topic: list the key concepts to know, common question types, and a short revision checklist.",
  translate:
    "Translate the provided text accurately into the requested language (if not specified, translate into Turkmen). Keep formatting.",
  plan:
    "Create a realistic study plan for the topic/goal: a day-by-day or week-by-week schedule with concrete tasks and estimated time.",
};

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        mode: z.enum(["chat", "explain", "summarize", "quiz", "exam", "translate", "plan"]),
        message: z.string().min(1).max(8000),
        lang: z.enum(["tk", "ru", "en"]).default("tk"),
        history: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(8000) }))
          .max(20)
          .default([]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI gateway is not configured");

    const langName = data.lang === "tk" ? "Turkmen" : data.lang === "ru" ? "Russian" : "English";
    const instructions = `${MODE_PROMPTS[data.mode]} Always reply in ${langName}. Be concise, friendly and academic. Use markdown formatting (headings, bold, lists) when it helps readability. Keep answers under 600 words unless the task requires more.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        instructions,
        input: [
          ...data.history.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: data.message },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI request failed (${res.status}): ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      output_text?: string;
      output?: { type: string; content?: { type: string; text?: string }[] }[];
    };
    const answer =
      json.output_text?.trim() ??
      json.output
        ?.find((o) => o.type === "message")
        ?.content?.map((c) => c.text ?? "")
        .join("")
        .trim();
    if (!answer) throw new Error("Empty AI response");
    return { answer };
  });
