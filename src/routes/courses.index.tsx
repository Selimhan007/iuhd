import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/ui-kit";
import { CourseCard } from "@/components/app/cards";
import { useI18n } from "@/lib/i18n";
import { courses } from "@/lib/demo-data";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "Courses — Student TM" },
      { name: "description", content: "All enrolled courses with teachers, credits, progress and current grade." },
      { property: "og:title", content: "Courses — Student TM" },
      { property: "og:description", content: "All enrolled courses with progress and grades." },
    ],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  const { t } = useI18n();
  return (
    <AppShell>
      <PageHeader title={t("nav.courses")} subtitle={`${courses.length} · 2026`} />
      <div className="grid gap-3 sm:grid-cols-2">
        {courses.map((c) => (
          <CourseCard key={c.id} course={c} />
        ))}
      </div>
    </AppShell>
  );
}
