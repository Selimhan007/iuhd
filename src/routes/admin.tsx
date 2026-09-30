import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  BookOpen,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
  Presentation,
  Shield,
  TrendingUp,
  Users,
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

type TabId = "students" | "teachers" | "courses" | "schedule";

const TABS: { id: TabId; icon: LucideIcon }[] = [
  { id: "students", icon: GraduationCap },
  { id: "teachers", icon: Presentation },
  { id: "courses", icon: BookOpen },
  { id: "schedule", icon: CalendarDays },
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
  const [tab, setTab] = useState<TabId>("students");

  const [data, setData] = useState<Record<TabId, ResourceItem[]>>(() => ({
    students: demoStudents.map((s) => ({ id: s.id, label: s.name, sub: `${s.studentCode} · ${group.name}` })),
    teachers: demoTeachers.map((x) => ({ id: x.id, label: x.name, sub: `${x.title} · ${x.email}` })),
    courses: demoCourses.map((c) => ({ id: c.id, label: c.name, sub: `${c.code} · ${c.credits} ECTS` })),
    schedule: lessons.map((l) => ({
      id: l.id,
      label: `${DAYS[l.weekday]} ${l.start}–${l.end} · ${courseById(l.courseId)?.name ?? ""}`,
      sub: `${group.name} · ${l.room} · ${l.type}`,
    })),
  }));

  const stats: { id: TabId; value: number; icon: LucideIcon; label: string }[] = [
    { id: "students", value: data.students.length, icon: GraduationCap, label: t("admin.students") },
    { id: "teachers", value: data.teachers.length, icon: Presentation, label: t("admin.teachers") },
    { id: "courses", value: data.courses.length, icon: BookOpen, label: t("admin.courses") },
    { id: "schedule", value: data.schedule.length, icon: CalendarDays, label: t("admin.lessonsWeek") },
  ];

  const lessonsWithoutRoom = data.schedule.filter((item) => item.sub.includes("—")).length;
  const averageGrade = Math.round(demoCourses.reduce((sum, course) => sum + course.grade, 0) / demoCourses.length);
  const averageAttendance = Math.round(
    demoCourses.reduce((sum, course, index) => sum + ([90, 95, 88, 92, 86, 97, 93, 91][index] ?? 90), 0) / demoCourses.length,
  );
  const monitoring = [
    { label: "Active students", value: data.students.length, detail: "Registered in the group", icon: Users, tone: "text-primary" },
    { label: "Average grade", value: `${averageGrade}%`, detail: "Across all courses", icon: TrendingUp, tone: "text-success" },
    { label: "Attendance", value: `${averageAttendance}%`, detail: "Average attendance rate", icon: CheckCircle2, tone: "text-success" },
    { label: "Attention needed", value: lessonsWithoutRoom, detail: "Lessons without room", icon: AlertTriangle, tone: lessonsWithoutRoom ? "text-warning" : "text-success" },
  ];
  const healthChecks = [
    { label: "Schedule", value: `${data.schedule.length}/16 lessons`, percent: Math.min(100, Math.round((data.schedule.length / 16) * 100)), ok: true },
    { label: "Course coverage", value: `${data.courses.length}/8 courses`, percent: Math.min(100, Math.round((data.courses.length / 8) * 100)), ok: data.courses.length >= 8 },
    { label: "Room assignment", value: lessonsWithoutRoom ? `${lessonsWithoutRoom} missing` : "Complete", percent: Math.round(((data.schedule.length - lessonsWithoutRoom) / Math.max(1, data.schedule.length)) * 100), ok: lessonsWithoutRoom === 0 },
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

      <section aria-label="System monitoring" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {monitoring.map((item) => (
          <div key={item.label} className="card-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.label}</span>
              <item.icon className={cn("h-4 w-4", item.tone)} />
            </div>
            <p className="mt-3 text-2xl font-bold">{item.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]" aria-label="Statistics and monitoring">
        <div className="card-surface p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Academic statistics</p>
              <p className="mt-1 text-xs text-muted-foreground">Current performance across the group</p>
            </div>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold">{averageGrade}%</p>
              <p className="mt-1 text-xs text-muted-foreground">Average grade</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{averageAttendance}%</p>
              <p className="mt-1 text-xs text-muted-foreground">Average attendance</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {demoCourses.slice(0, 4).map((course) => (
              <div key={course.id}>
                <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                  <span className="truncate font-medium">{course.code} · {course.name}</span>
                  <span className="shrink-0 text-muted-foreground">{course.grade}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${course.grade}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card-surface p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">System monitoring</p>
              <p className="mt-1 text-xs text-muted-foreground">Data readiness and coverage</p>
            </div>
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="mt-5 space-y-4">
            {healthChecks.map((check) => (
              <div key={check.label}>
                <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium">{check.label}</span>
                  <span className={cn(check.ok ? "text-success" : "text-warning")}>{check.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className={cn("h-full rounded-full transition-all", check.ok ? "bg-success" : "bg-warning")} style={{ width: `${Math.max(0, check.percent)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className={cn("mt-5 flex items-center gap-2 rounded-xl px-3 py-2 text-xs", lessonsWithoutRoom ? "bg-warning/10 text-warning" : "bg-success/10 text-success")}>
            {lessonsWithoutRoom ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
            <span>{lessonsWithoutRoom ? `${lessonsWithoutRoom} schedule item needs attention` : "All core systems are ready"}</span>
          </div>
        </div>
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
