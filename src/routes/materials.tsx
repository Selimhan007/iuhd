import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { EmptyState, PageHeader } from "@/components/app/ui-kit";
import { MaterialCard } from "@/components/app/cards";
import { useI18n } from "@/lib/i18n";
import { courses, materials } from "@/lib/demo-data";

export const Route = createFileRoute("/materials")({
  head: () => ({
    meta: [
      { title: "Study materials — Student TM" },
      { name: "description", content: "Lecture PDFs, slides, documents and video links organised by course." },
      { property: "og:title", content: "Study materials — Student TM" },
      { property: "og:description", content: "Lecture PDFs, slides and links by course." },
    ],
  }),
  component: MaterialsPage,
});

function MaterialsPage() {
  const { t } = useI18n();
  const grouped = courses
    .map((c) => ({ course: c, items: materials.filter((m) => m.courseId === c.id) }))
    .filter((g) => g.items.length);

  return (
    <AppShell>
      <PageHeader title={t("materials.title")} />
      {grouped.length === 0 ? (
        <EmptyState message={t("empty.materials")} />
      ) : (
        <div className="space-y-7">
          {grouped.map(({ course, items }) => (
            <section key={course.id}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {course.name}
              </h2>
              <div className="space-y-3">
                {items.map((m) => (
                  <MaterialCard key={m.id} m={m} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </AppShell>
  );
}
