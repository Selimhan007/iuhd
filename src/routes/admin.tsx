import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  BookOpen,
  CalendarDays,
  CalendarHeart,
  GraduationCap,
  Megaphone,
  Presentation,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { ResourceManager, type ResourceItem } from "@/components/admin/resource-manager";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  announcements as demoAnnouncements,
  courseById,
  courses as demoCourses,
  events as demoEvents,
  faculty,
  group,
  lessons,
  students as demoStudents,
  teachers as demoTeachers,
  university,
} from "@/lib/demo-data";

export const Route = createFileRoute("/admin")({
  validateSearch: (s: Record<string, unknown>): { tab?: string | undefined } => ({
    tab: typeof s["tab"] === "string" ? s["tab"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Admin panel — Student TM" },
      { name: "description", content: "Manage students, teachers, courses, schedule, announcements and events." },
      { property: "og:title", content: "Admin panel — Student TM" },
      { property: "og:description", content: "Manage students, teachers, courses and schedule." },
    ],
  }),
  component: AdminPage,
});

type TabId = "students" | "teachers" | "courses" | "schedule" | "announcements" | "events";

const TABS: { id: TabId; icon: LucideIcon }[] = [
  { id: "students", icon: GraduationCap },
  { id: "teachers", icon: Presentation },
  { id: "courses", icon: BookOpen },
  { id: "schedule", icon: CalendarDays },
  { id: "announcements", icon: Megaphone },
  { id: "events", icon: CalendarHeart },
];

const DAYS = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function AdminPage() {
  return (
    <AppShell allow={["admin", "superadmin"]}>
      <AdminConsole />
    </AppShell>
  );
}

function AdminConsole() {
  const { t } = useI18n();
  const search = Route.useSearch();
  const navigateTab = Route.useNavigate();
  const tab: TabId = TABS.some((x) => x.id === search.tab) ? (search.tab as TabId) : "students";
  const setTab = (id: TabId) => navigateTab({ search: { tab: id }, replace: true });

  const [data, setData] = useState<Record<TabId, ResourceItem[]>>(() => ({
    students: demoStudents.map((s) => ({ id: s.id, label: s.name, sub: `${s.studentCode} · ${group.name}` })),
    teachers: demoTeachers.map((x) => ({ id: x.id, label: x.name, sub: `${x.title} · ${x.email}` })),
    courses: demoCourses.map((c) => ({ id: c.id, label: c.name, sub: `${c.code} · ${c.credits} ECTS` })),
    schedule: lessons.map((l) => ({
      id: l.id,
      label: `${DAYS[l.weekday]} ${l.start}–${l.end} · ${courseById(l.courseId)?.name ?? ""}`,
      sub: `${group.name} · ${l.room} · ${l.type}`,
    })),
    announcements: demoAnnouncements.map((a) => ({ id: a.id, label: a.title, sub: `${a.author} · ${a.date}` })),
    events: demoEvents.map((e) => ({ id: e.id, label: e.title, sub: `${e.date} · ${e.place}` })),
  }));

  const stats: { id: TabId; value: number; icon: LucideIcon; label: string }[] = [
    { id: "students", value: data.students.length, icon: GraduationCap, label: t("admin.students") },
    { id: "teachers", value: data.teachers.length, icon: Presentation, label: t("admin.teachers") },
    { id: "courses", value: data.courses.length, icon: BookOpen, label: t("admin.courses") },
    { id: "schedule", value: data.schedule.length, icon: CalendarDays, label: t("admin.lessonsWeek") },
    { id: "announcements", value: data.announcements.length, icon: Megaphone, label: t("admin.announcements") },
    { id: "events", value: data.events.length, icon: CalendarHeart, label: t("admin.events") },
  ];

  return (
    <div className="animate-rise space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-card sm:flex-row sm:items-center">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Shield className="h-7 w-7" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">{t("admin.title")}</p>
          <h1 className="mt-1 text-balance text-2xl font-bold tracking-tight">{university.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("admin.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-medium sm:flex-col sm:items-end">
          <span className="rounded-full bg-primary-soft px-3 py-1 text-primary">{university.shortName}</span>
          <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">{faculty.name}</span>
        </div>
      </section>

      <section aria-label={t("admin.overview")} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <button
            key={s.id}
            onClick={() => setTab(s.id)}
            aria-pressed={tab === s.id}
            className={cn(
              "card-surface flex flex-col items-start p-4 text-left transition-colors hover:border-primary/50",
              tab === s.id && "border-primary ring-1 ring-primary",
            )}
          >
            <s.icon className="h-5 w-5 text-primary" />
            <span className="mt-3 text-2xl font-bold leading-none">{s.value}</span>
            <span className="mt-1 w-full truncate text-xs text-muted-foreground">{s.label}</span>
          </button>
        ))}
      </section>

      <div className="flex flex-col gap-4 lg:flex-row">
        <nav
          aria-label={t("admin.title")}
          className="flex gap-1 overflow-x-auto rounded-2xl bg-muted p-1 lg:w-52 lg:shrink-0 lg:flex-col lg:self-start"
        >
          {TABS.map((x) => (
            <button
              key={x.id}
              onClick={() => setTab(x.id)}
              aria-current={tab === x.id ? "page" : undefined}
              className={cn(
                "tap-target flex items-center gap-2 whitespace-nowrap rounded-xl px-3 text-sm font-semibold transition-colors",
                tab === x.id ? "bg-card text-primary shadow-soft" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <x.icon className="h-4 w-4" />
              {t(`admin.${x.id}`)}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          <ResourceManager
            key={tab}
            title={t(`admin.${tab}`)}
            items={data[tab]}
            onChange={(next) => setData((d) => ({ ...d, [tab]: next }))}
          />
        </div>
      </div>
    </div>
  );
}
