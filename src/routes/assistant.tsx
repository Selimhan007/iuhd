import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { Card, PageHeader, Pill } from "@/components/app/ui-kit";
import { useI18n } from "@/lib/i18n";
import { Sparkles } from "lucide-react";

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
  const ideas = [
    "Explain a topic",
    "Summarise a PDF",
    "Generate a quiz",
    "Prepare for an exam",
    "Translate study material",
    "Create a study plan",
  ];

  return (
    <AppShell>
      <PageHeader title={t("nav.ai")} subtitle={t("ai.desc")} />
      <Card className="mb-5 flex items-center justify-between bg-primary text-primary-foreground">
        <span className="flex items-center gap-3">
          <Sparkles className="h-6 w-6" />
          <span className="font-semibold">{t("nav.ai")}</span>
        </span>
        <Pill className="bg-primary-foreground/20 text-primary-foreground">{t("ai.soon")}</Pill>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2">
        {ideas.map((i) => (
          <Card key={i} className="flex items-center justify-between opacity-70">
            <span className="text-sm font-medium">{i}</span>
            <Pill>{t("ai.soon")}</Pill>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
