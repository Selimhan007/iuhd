import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Card, EmptyState, PageHeader, Pill } from "@/components/app/ui-kit";
import { ScheduleCard, lessonStatus } from "@/components/app/cards";
import { useI18n } from "@/lib/i18n";
import { courseById, group, lessons, teacherOfCourse, type Lesson } from "@/lib/demo-data";
import { X } from "lucide-react";

export const Route = createFileRoute("/schedule")({
  head: () => ({
    meta: [
      { title: "Schedule — Student TM" },
      { name: "description", content: "Daily and weekly university timetable with rooms, teachers and lesson types." },
      { property: "og:title", content: "Schedule — Student TM" },
      { property: "og:description", content: "Daily and weekly university timetable." },
    ],
  }),
  component: SchedulePage,
});

const DAY_KEYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function SchedulePage() {
  const { t } = useI18n();
  const [view, setView] = useState<"today" | "week">("today");
  const [selected, setSelected] = useState<Lesson | null>(null);
  const now = new Date();
  const weekday = ((now.getDay() + 6) % 7) + 1;

  const byDay = (d: number) => lessons.filter((l) => l.weekday === d).sort((a, b) => a.start.localeCompare(b.start));
  const todays = byDay(weekday);

  return (
    <AppShell>
      <PageHeader title={t("nav.schedule")} subtitle={`${t("schedule.group")} ${group.name}`} />

      <div className="mb-5 inline-flex rounded-xl bg-muted p-1">
        {(["today", "week"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`tap-target rounded-lg px-5 text-sm font-semibold transition-colors ${
              view === v ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
            }`}
          >
            {t(`schedule.${v}`)}
          </button>
        ))}
      </div>

      {view === "today" ? (
        todays.length === 0 ? (
          <EmptyState message={t("home.noClasses")} />
        ) : (
          <div className="space-y-3">
            {todays.map((l) => (
              <ScheduleCard key={l.id} lesson={l} status={lessonStatus(l, now)} onClick={() => setSelected(l)} />
            ))}
          </div>
        )
      ) : (
        <div className="space-y-6">
          {[1, 2, 3, 4, 5, 6].map((d) => (
            <section key={d}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {DAY_KEYS[d - 1]}
              </h2>
              <div className="space-y-3">
                {byDay(d).map((l) => (
                  <ScheduleCard
                    key={l.id}
                    lesson={l}
                    status={d === weekday ? lessonStatus(l, now) : l.cancelled ? "cancelled" : "upcoming"}
                    onClick={() => setSelected(l)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl border border-border bg-card p-5 sm:rounded-3xl">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-bold">{t("schedule.details")}</h3>
              <button onClick={() => setSelected(null)} aria-label={t("close")} className="tap-target">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <Card className="space-y-2">
              <p className="text-lg font-semibold">{courseById(selected.courseId)?.name}</p>
              <Pill tone="primary">{t(`type.${selected.type}`)}</Pill>
              <Row label={t("schedule.teacher")} value={teacherOfCourse(selected.courseId)?.name ?? "—"} />
              <Row label={t("schedule.room")} value={selected.room} />
              <Row label={t("nav.schedule")} value={`${selected.start} – ${selected.end}`} />
              <Row label={t("schedule.group")} value={group.name} />
              <Row label={t("schedule.notes")} value={selected.notes ?? "—"} />
            </Card>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
