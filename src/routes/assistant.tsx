import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Card, PageHeader } from "@/components/app/ui-kit";
import { useI18n } from "@/lib/i18n";
import { Bot, Send, Sparkles, User } from "lucide-react";

 type Message = { role: "user" | "assistant"; text: string };

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Study Assistant — Student TM" },
      { name: "description", content: "An AI study assistant for explanations, summaries and study plans — coming soon." },
      { property: "og:title", content: "AI Study Assistant — Student TM" },
      { property: "og:description", content: "Explanations, summaries and study plans — coming soon." },
    ],
  }),
  component: AssistantPage,
});

function AssistantPage() {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();
    if (!message || isLoading) return;
    setInput("");
    setError("");
    setMessages((current) => [...current, { role: "user", text: message }]);
    setIsLoading(true);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = (await response.json()) as { text?: string; error?: string };
      if (!response.ok || !data.text) throw new Error(data.error ?? "Request failed");
      setMessages((current) => [...current, { role: "assistant", text: data.text! }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AppShell>
      <PageHeader title={t("nav.ai")} subtitle={t("ai.desc")} />
      <Card className="flex min-h-[60vh] flex-col gap-4 p-0 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border bg-primary/10 px-5 py-4">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Sparkles /></div>
          <div><p className="font-semibold">Okuwçy kömekçisi</p><p className="text-xs text-muted-foreground">Ask about any study topic</p></div>
        </div>
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-2">
          {messages.length === 0 ? <div className="m-auto max-w-sm text-center text-sm text-muted-foreground"><Bot className="mx-auto mb-3 size-10 text-primary" /><p>Ask me to explain a topic, make a quiz, or create a study plan.</p></div> : null}
          {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`flex max-w-[85%] gap-2 rounded-2xl px-4 py-3 text-sm ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{message.role === "assistant" ? <Bot className="mt-0.5 size-4 shrink-0" /> : <User className="mt-0.5 size-4 shrink-0" />}<span className="whitespace-pre-wrap">{message.text}</span></div></div>)}
          {isLoading ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Bot className="size-4" /> Thinking…</div> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border p-4">
          <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask okuwçy kömekçisi…" aria-label="Message" maxLength={4000} className="min-w-0 flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <button type="submit" disabled={isLoading || !input.trim()} aria-label="Send message" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-50"><Send className="size-4" /></button>
        </form>
      </Card>
    </AppShell>
  );
}
