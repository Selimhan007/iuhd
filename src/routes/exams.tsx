import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { EmptyState, PageHeader } from "@/components/app/ui-kit";
import { ExamCard } from "@/components/app/cards";
import { useI18n } from "@/lib/i18n";
import { exams } from "@/lib/demo-data";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/exams")({
  head: () => ({
    meta: [
      { title: "Exams — Student TM" },
      { name: "description", content: "Upcoming midterm, final and quiz exams with dates, times and rooms." },
      { property: "og:title", content: "Exams — Student TM" },
      { property: "og:description", content: "Upcoming exams with dates, times and rooms." },
    ],
  }),
  component: ExamsPage,
});

function ExamsPage() {
  const { t } = useI18n();
  const sorted = exams.slice().sort((a, b) => a.date.localeCompare(b.date));

  return (
    <AppShell>
      <PageHeader title={t("exams.upcoming")} />
      {sorted.length === 0 ? (
        <EmptyState message={t("empty.exams")} icon={<FileText className="h-6 w-6" />} />
      ) : (
        <div className="space-y-3">
          {sorted.map((e) => (
            <ExamCard key={e.id} exam={e} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
