import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Card, EmptyState, Pill, SectionTitle } from "@/components/app/ui-kit";
import { AnnouncementCard, AssignmentCard, ScheduleCard, lessonStatus } from "@/components/app/cards";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { announcements, assignments, courseById, lessons, teacherOfCourse } from "@/lib/demo-data";
import {
  CalendarDays,
  GraduationCap,
  CheckSquare,
  ClipboardList,
  BookOpen,
  FileText,
  Clock,
  MapPin,
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
      <div className="animate-rise space-y-8">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </header>

        {next ? (
          <button type="button" onClick={() => navigate({ to: "/schedule" })} className="block w-full text-left">
          <Card className="bg-primary text-primary-foreground shadow-card">
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

        <section>
          <SectionTitle title={t("home.today")} to="/schedule" label={t("home.viewAll")} />
          {todays.length === 0 ? (
            <EmptyState message={t("home.noClasses")} />
          ) : (
            <div className="space-y-3">
              {todays.map((l) => (
                <ScheduleCard key={l.id} lesson={l} status={lessonStatus(l, now)} />
              ))}
            </div>
          )}
        </section>

        <section>
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

        <section>
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
                className="card-surface flex flex-col items-center gap-2 px-2 py-4 text-center transition-transform hover:-translate-y-0.5"
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
