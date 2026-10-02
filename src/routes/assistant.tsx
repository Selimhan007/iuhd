import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Card, PageHeader } from "@/components/app/ui-kit";
import { useI18n } from "@/lib/i18n";
import { askAssistant, type AiMode } from "@/lib/ai.functions";
import { BookOpen, FileText, Languages, ListChecks, Loader2, MessageSquare, RotateCcw, Send, Sparkles, Target } from "lucide-react";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Study Assistant — Student TM" },
      { name: "description", content: "An AI study assistant for explanations, summaries, quizzes and study plans." },
      { property: "og:title", content: "AI Study Assistant — Student TM" },
      { property: "og:description", content: "Explanations, summaries, quizzes and study plans powered by AI." },
    ],
  }),
  component: AssistantPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const MODES: { id: AiMode; icon: typeof MessageSquare }[] = [
  { id: "chat", icon: MessageSquare },
  { id: "explain", icon: BookOpen },
  { id: "summarize", icon: FileText },
  { id: "quiz", icon: ListChecks },
  { id: "exam", icon: Target },
  { id: "translate", icon: Languages },
  { id: "plan", icon: Sparkles },
];

function renderMarkdown(text: string) {
  return text.split(/\n{2,}/).map((block, i) => {
    const lines = block.split("\n");
    const isList = lines.every((l) => /^\s*([-*•]|\d+[.)])\s/.test(l) || l.trim() === "");
    const inline = (s: string, key: number) => (
      <span key={key}>
        {s.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j}>{part.slice(2, -2)}</strong>
          ) : (
            part
          ),
        )}
      </span>
    );
    if (isList && lines.some((l) => l.trim())) {
      return (
        <ul key={i} className="my-1 list-disc space-y-1 pl-5">
          {lines.filter((l) => l.trim()).map((l, j) => (
            <li key={j}>{inline(l.replace(/^\s*([-*•]|\d+[.)])\s+/, ""), j)}</li>
          ))}
        </ul>
      );
    }
    if (/^#{1,3}\s/.test(block)) {
      return (
        <p key={i} className="mt-2 font-semibold">
          {inline(block.replace(/^#{1,3}\s+/, ""), i)}
        </p>
      );
    }
    return (
      <p key={i} className="my-1 whitespace-pre-wrap">
        {inline(block, i)}
      </p>
    );
  });
}

function AssistantPage() {
  const { t, lang } = useI18n();
  const [mode, setMode] = useState<AiMode>("chat");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setError(false);
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setBusy(true);
    try {
      const { answer } = await askAssistant({
        data: {
          mode,
          message: text,
          lang,
          history: next.slice(-10, -1).map((m) => ({ role: m.role, content: m.content })),
        },
      });
      setMessages([...next, { role: "assistant", content: answer }]);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <AppShell>
      <PageHeader title={t("nav.ai")} subtitle={t("ai.desc")} />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {MODES.map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`tap-target flex shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors ${
              mode === id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {t(`ai.mode.${id}`)}
          </button>
        ))}
      </div>

      <Card className="mb-4 min-h-[320px] p-4">
        {messages.length === 0 ? (
          <div className="flex h-[280px] flex-col items-center justify-center gap-3 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-7 w-7" />
            </span>
            <p className="max-w-sm text-sm text-muted-foreground">{t("ai.empty")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {m.role === "assistant" ? renderMarkdown(m.content) : m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("ai.thinking")}
              </div>
            )}
            {error && <p className="text-sm text-destructive">{t("ai.error")}</p>}
            <div ref={bottomRef} />
          </div>
        )}
      </Card>

      <div className="sticky bottom-20 flex gap-2 md:bottom-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder={t("ai.placeholder")}
          rows={2}
          className="flex-1 resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <div className="flex flex-col gap-2">
          <button
            onClick={() => void send()}
            disabled={busy || !input.trim()}
            className="tap-target flex items-center justify-center rounded-xl bg-primary px-4 text-primary-foreground disabled:opacity-50"
            aria-label={t("ai.send")}
          >
            <Send className="h-5 w-5" />
          </button>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="tap-target flex items-center justify-center rounded-xl border border-border bg-card px-4 text-muted-foreground"
              aria-label={t("ai.newChat")}
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
