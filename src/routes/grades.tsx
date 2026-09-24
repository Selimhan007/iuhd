import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { Card, PageHeader, ProgressBar } from "@/components/app/ui-kit";
import { GradeCard } from "@/components/app/cards";
import { useI18n } from "@/lib/i18n";
import { courses, gpa, grades } from "@/lib/demo-data";

export const Route = createFileRoute("/grades")({
  head: () => ({
    meta: [
      { title: "Grades — Student TM" },
      { name: "description", content: "GPA, subject grades, midterm and final results with progress visualisation." },
      { property: "og:title", content: "Grades — Student TM" },
      { property: "og:description", content: "GPA and subject grades at a glance." },
    ],
  }),
  component: GradesPage,
});

function GradesPage() {
  const { t } = useI18n();
  const average = Math.round(grades.reduce((s, g) => s + g.total, 0) / grades.length);

  return (
    <AppShell>
      <PageHeader title={t("nav.grades")} />

      <Card className="mb-5 bg-primary text-primary-foreground">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide opacity-80">{t("grades.gpa")}</p>
            <p className="mt-1 text-4xl font-bold">{gpa.toFixed(2)}</p>
            <p className="text-sm opacity-80">/ 4.00</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide opacity-80">{t("grades.average")}</p>
            <p className="mt-1 text-3xl font-bold">{average}</p>
          </div>
        </div>
        <div className="mt-4 opacity-90">
          <ProgressBar value={(gpa / 4) * 100} color="var(--primary-foreground)" />
        </div>
      </Card>

      <div className="space-y-3">
        {grades.map((g) => (
          <GradeCard key={g.id} courseId={g.courseId} total={g.total} letter={g.letter} />
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("grades.total")}
      </h2>
      <Card className="space-y-4">
        {grades.map((g) => {
          const course = courses.find((c) => c.id === g.courseId);
          return (
            <div key={g.id}>
              <p className="mb-2 text-sm font-semibold">{course?.name}</p>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {(["midterm", "final", "assignments", "exams"] as const).map((k) => (
                  <div key={k} className="rounded-lg bg-muted px-2 py-2">
                    <p className="text-muted-foreground">{t(`grades.${k}`)}</p>
                    <p className="mt-0.5 font-bold">{g[k]}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </Card>
    </AppShell>
  );
}
