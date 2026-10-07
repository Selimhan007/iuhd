import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Card, EmptyState, Pill, SectionTitle } from "@/components/app/ui-kit";
import { AnnouncementCard, AssignmentCard, ScheduleCard, lessonStatus } from "@/components/app/cards";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { announcements, assignments, courseById, lessons, teacherOfCourse, group, type Lesson } from "@/lib/demo-data";
import {
  CalendarDays,
  GraduationCap,
  CheckSquare,
  ClipboardList,
  BookOpen,
  FileText,
  Clock,
  MapPin,
  X,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home — Student TM" },
      { name: "description", content: "Your next class, today's schedule, tasks and university announcements." },
      { property: "og:title", content: "Home — Student TM" },
      { property: "og:description", content: "Your next class, today's schedule, tasks and announcements." },
    ],
  }),
  component: HomePage,
});

const quickActions = [
  { to: "/schedule", key: "nav.schedule", icon: CalendarDays },
  { to: "/grades", key: "nav.grades", icon: GraduationCap },
  { to: "/attendance", key: "nav.attendance", icon: CheckSquare },
  { to: "/tasks", key: "nav.tasks", icon: ClipboardList },
  { to: "/courses", key: "nav.courses", icon: BookOpen },
  { to: "/materials", key: "nav.materials", icon: FileText },
] as const;

function HomePage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [now, setNow] = useState(() => new Date());
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    if (!selectedLesson) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedLesson(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedLesson]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const weekday = ((now.getDay() + 6) % 7) + 1;
  const todays = useMemo(
    () => lessons.filter((l) => l.weekday === weekday).sort((a, b) => a.start.localeCompare(b.start)),
    [weekday],
  );

  const mins = now.getHours() * 60 + now.getMinutes();
  const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
  const next = todays.find((l) => !l.cancelled && toMin(l.start) > mins) ?? todays.find((l) => !l.cancelled);
  const diff = next ? toMin(next.start) - mins : 0;

  const greeting =
    now.getHours() < 12 ? t("home.morning") : now.getHours() < 18 ? t("home.afternoon") : t("home.evening");
  const firstName = (user?.name ?? "").split(" ")[0];

  const upcomingTasks = assignments
    .filter((a) => a.dueInDays >= 0 && a.status !== "graded")
    .sort((a, b) => a.dueInDays - b.dueInDays)
    .slice(0, 3);

  return (
    <AppShell allow={["student"]}>
      <div className="animate-rise flex flex-col gap-9">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </header>

        {next ? (
          <button type="button" onClick={() => navigate({ to: "/schedule" })} className="block w-full text-left">
          <Card className="relative overflow-hidden border-primary/20 bg-primary text-primary-foreground shadow-xl shadow-primary/15 before:absolute before:-right-16 before:-top-20 before:size-48 before:rounded-full before:bg-white/10">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{t("home.nextClass")}</p>
            <p className="mt-2 text-xl font-bold">{courseById(next.courseId)?.name}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm opacity-90">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {next.start} – {next.end}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {t("schedule.room")} {next.room}
              </span>
            </div>
            <p className="mt-1 text-sm opacity-90">
              {t("schedule.teacher")}: {teacherOfCourse(next.courseId)?.name}
            </p>
            <p className="mt-4 inline-flex rounded-full bg-primary-foreground/15 px-3 py-1 text-sm font-semibold">
              {diff > 0
                ? `${t("home.startsIn")} ${diff >= 60 ? `${Math.floor(diff / 60)} ${t("home.hours")} ` : ""}${diff % 60} ${t("home.minutes")}`
                : t("status.inProgress")}
            </p>
          </Card>
          </button>
        ) : null}

        <section className="animate-schedule-card" style={{ animationDelay: "60ms" }}>
          <SectionTitle title={t("home.today")} to="/schedule" label={t("home.viewAll")} />
          {todays.length === 0 ? (
            <EmptyState message={t("home.noClasses")} />
          ) : (
            <div className="space-y-3 motion-card">
              {todays.map((l) => (
                <ScheduleCard key={l.id} lesson={l} status={lessonStatus(l, now)} onClick={() => setSelectedLesson(l)} />
              ))}
            </div>
          )}
        </section>

        {selectedLesson ? (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/35 p-0 backdrop-blur-lg sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="lesson-details-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedLesson(null); }}>
            <div className="animate-sheet-enter w-full max-w-md rounded-t-3xl border border-border bg-card/95 p-5 shadow-2xl backdrop-blur-xl sm:rounded-3xl">
              <div className="mb-4 flex items-start justify-between">
                <h2 id="lesson-details-title" className="text-lg font-bold">{t("schedule.details")}</h2>
                <button type="button" onClick={() => setSelectedLesson(null)} aria-label={t("close")} className="tap-target">
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <Card className="space-y-2">
                <p className="text-lg font-semibold">{courseById(selectedLesson.courseId)?.name}</p>
                <Pill tone="primary">{t(`type.${selectedLesson.type}`)}</Pill>
                <LessonDetailRow label={t("schedule.teacher")} value={teacherOfCourse(selectedLesson.courseId)?.name ?? "—"} />
                <LessonDetailRow label={t("schedule.room")} value={selectedLesson.room} />
                <LessonDetailRow label={t("nav.schedule")} value={`${selectedLesson.start} – ${selectedLesson.end}`} />
                <LessonDetailRow label={t("schedule.group")} value={group.name} />
                <LessonDetailRow label={t("schedule.notes")} value={selectedLesson.notes ?? "—"} />
              </Card>
            </div>
          </div>
        ) : null}

        <section className="animate-schedule-card" style={{ animationDelay: "120ms" }}>
          <SectionTitle title={t("home.tasks")} to="/tasks" label={t("home.viewAll")} />
          {upcomingTasks.length === 0 ? (
            <EmptyState message={t("empty.tasks")} />
          ) : (
            <div className="space-y-3">
              {upcomingTasks.map((a) => (
                <AssignmentCard key={a.id} a={a} onClick={() => navigate({ to: "/tasks" })} />
              ))}
            </div>
          )}
        </section>

        <section className="animate-schedule-card" style={{ animationDelay: "180ms" }}>
          <SectionTitle title={t("home.announcements")} to="/announcements" label={t("home.viewAll")} />
          <div className="space-y-3">
            {announcements
              .slice()
              .sort((a, b) => Number(!!b.important) - Number(!!a.important))
              .slice(0, 2)
              .map((a) => (
                <Link key={a.id} to="/announcements" className="block">
                  <AnnouncementCard a={a} />
                </Link>
              ))}
          </div>
        </section>

        <section>
          <SectionTitle title={t("home.quickActions")} />
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {quickActions.map((q) => (
              <Link
                key={q.to}
                to={q.to}
                className="card-surface motion-card flex flex-col items-center gap-2 px-2 py-4 text-center transition-transform hover:-translate-y-0.5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <q.icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-medium leading-tight">{t(q.key)}</span>
              </Link>
            ))}
          </div>
        </section>

        <Link to="/assistant" className="block">
          <Card className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{t("nav.ai")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("ai.desc")}</p>
            </div>
            <Pill tone="primary">{t("ai.soon")}</Pill>
          </Card>
        </Link>
      </div>
    </AppShell>
  );
}

function LessonDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

