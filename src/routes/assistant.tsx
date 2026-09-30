import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Card, PageHeader } from "@/components/app/ui-kit";
import { useI18n } from "@/lib/i18n";
import { Send, Sparkles } from "lucide-react";
import { LatticeLoader } from "@/components/app/LatticeLoader";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Oquw Komekcisi — Student TM" },
      { name: "description", content: "AI Oquw Komekcisi — your personal study assistant." },
    ],
  }),
  component: AssistantPage,
});

type Message = { role: "user" | "assistant"; content: string };

function AssistantPage() {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage(message = input) {
    const text = message.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((current) => [...current, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setLoading(true);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const payload = (await response.json()) as { answer?: string; error?: string };
      if (!response.ok || !payload.answer) throw new Error(payload.error ?? "Assistant request failed");
      setMessages((current) => {
        const next = [...current];
        next[next.length - 1] = { role: "assistant", content: payload.answer! };
        return next;
      });
    } catch {
      setMessages((current) => {
        const next = [...current];
        next[next.length - 1] = { role: "assistant", content: "Не удалось получить ответ. Проверьте подключение и попробуйте ещё раз." };
        return next;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <PageHeader title="AI Oquw Komekcisi" subtitle={t("ai.desc")} />
      <Card className="flex min-h-[480px] flex-col gap-4">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="rounded-xl bg-primary/15 p-2 text-primary"><Sparkles className="h-5 w-5" /></div>
          <div><p className="font-semibold">AI Oquw Komekcisi</p><p className="text-xs text-muted-foreground">Ваш помощник по учёбе</p></div>
        </div>
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="m-auto max-w-md text-center"><Sparkles className="mx-auto mb-3 h-8 w-8 text-primary" /><p className="font-medium">Что изучаем сегодня?</p><p className="mt-1 text-sm text-muted-foreground">Спросите об экзамене, теме или попросите составить план.</p></div>
          ) : messages.map((message, index) => <div key={index} className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm ${message.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"}`}>{message.content || (loading ? <LatticeLoader label="Ýüklenýär" color="currentColor" /> : "")}</div>)}
        </div>
        <div className="flex gap-2 border-t border-border pt-4">
          <input aria-label="Сообщение" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.nativeEvent.isComposing && event.keyCode !== 229) void sendMessage(); }} placeholder="Напишите вопрос..." className="min-w-0 flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary" />
          <button aria-label="Отправить" onClick={() => void sendMessage()} disabled={loading || !input.trim()} className="rounded-xl bg-primary px-4 text-primary-foreground disabled:opacity-50"><Send className="h-4 w-4" /></button>
        </div>
      </Card>
    </AppShell>
  );
}
