import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, CalendarDays, CheckSquare, ClipboardList, Users, type LucideIcon } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Card, SectionTitle } from "@/components/app/ui-kit";
import {
  AttendancePanel,
  CourseGrid,
  StudentsPanel,
  SubmissionsPanel,
  TodayClasses,
  studentAttendance,
  type Submission,
} from "@/components/teacher/panels";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { assignments, courseById, courses, group, lessons, students } from "@/lib/demo-data";

export const Route = createFileRoute("/teacher")({
  validateSearch: (s: Record<string, unknown>): { tab?: string | undefined } => ({
    tab: typeof s["tab"] === "string" ? s["tab"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Teacher dashboard — Student TM" },
      { name: "description", content: "Courses, groups, submissions, grading and attendance for teachers." },
      { property: "og:title", content: "Teacher dashboard — Student TM" },
      { property: "og:description", content: "Courses, submissions, grading and attendance." },
    ],
  }),
  component: TeacherPage,
});

const TABS: { id: "myCourses" | "attendance" | "submissions" | "students"; icon: LucideIcon }[] = [
  { id: "myCourses", icon: BookOpen },
  { id: "attendance", icon: CheckSquare },
  { id: "submissions", icon: ClipboardList },
  { id: "students", icon: Users },
];

function TeacherPage() {
  return (
    <AppShell allow={["teacher"]}>
      <TeacherDashboard />
    </AppShell>
  );
}

function TeacherDashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const search = Route.useSearch();
  const navigateTab = Route.useNavigate();
  const tab: (typeof TABS)[number]["id"] = TABS.some((x) => x.id === search.tab) ? (search.tab as (typeof TABS)[number]["id"]) : "myCourses";
  const setTab = (id: (typeof TABS)[number]["id"]) => navigateTab({ search: { tab: id }, replace: true });
  const [now] = useState(() => new Date());

  const myCourses = useMemo(() => courses.filter((c) => c.teacherId === user?.id), [user?.id]);
  const myCourseIds = useMemo(() => new Set(myCourses.map((c) => c.id)), [myCourses]);
  const myLessons = useMemo(() => lessons.filter((l) => myCourseIds.has(l.courseId)), [myCourseIds]);
  const [attendanceCourse, setAttendanceCourse] = useState(myCourses[0]?.id ?? "");

  const weekday = ((now.getDay() + 6) % 7) + 1;
  const todays = myLessons.filter((l) => l.weekday === weekday).sort((a, b) => a.start.localeCompare(b.start));

  const submissions: Submission[] = useMemo(
    () =>
      assignments
        .filter((a) => myCourseIds.has(a.courseId) && a.dueInDays <= 8)
        .flatMap((a, ai) =>
          students.slice(ai, ai + 3).map((s, si) => ({
            id: `${a.id}-${s.id}`,
            assignment: a,
            studentName: s.name,
            score: (ai + si) % 3 === 0 ? 80 + ((ai * 5 + si * 3) % 20) : undefined,
          })),
        ),
    [myCourseIds],
  );
  const pending = submissions.filter((s) => s.score === undefined).length;
  const avgAttendance = Math.round(
    students.reduce((sum, _, i) => sum + studentAttendance(i), 0) / Math.max(students.length, 1),
  );

  const greeting =
    now.getHours() < 12 ? t("home.morning") : now.getHours() < 18 ? t("home.afternoon") : t("home.evening");

  const stats = [
    { label: t("teacher.myCourses"), value: myCourses.length, icon: BookOpen },
    { label: t("teacher.students"), value: students.length, icon: Users },
    { label: t("teacher.pending"), value: pending, icon: ClipboardList },
    { label: t("teacher.avgAttendance"), value: `${avgAttendance}%`, icon: CheckSquare },
  ];

  return (
    <div className="animate-rise space-y-8">
      <section className="rounded-3xl bg-primary p-6 text-primary-foreground shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wider opacity-80">{t("teacher.title")}</p>
        <h1 className="mt-2 text-balance text-2xl font-bold tracking-tight">
          {greeting}, {user?.name}
        </h1>
        <p className="mt-1 text-sm opacity-90">{t("teacher.subtitle")}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-sm">
          <span className="flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 font-medium">
            <CalendarDays className="h-4 w-4" />
            {now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
          </span>
          <span className="rounded-full bg-primary-foreground/15 px-3 py-1 font-medium">
            {t("teacher.groups")}: {group.name}
          </span>
          <span className="rounded-full bg-primary-foreground/15 px-3 py-1 font-medium">
            {myLessons.length} {t("teacher.lessonsWeek").toLowerCase()}
          </span>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <s.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xl font-bold leading-tight">{s.value}</p>
              <p className="truncate text-xs text-muted-foreground">{s.label}</p>
            </div>
          </Card>
        ))}
      </section>

      <section>
        <SectionTitle title={t("teacher.todayClasses")} to="/schedule" label={t("home.viewAll")} />
        <TodayClasses
          lessons={todays}
          courseById={courseById}
          onMark={(id) => {
            setAttendanceCourse(id);
            setTab("attendance");
          }}
        />
      </section>

      <section>
        <div role="tablist" className="mb-5 flex gap-1 overflow-x-auto rounded-2xl bg-muted p-1">
          {TABS.map((x) => (
            <button
              key={x.id}
              role="tab"
              aria-selected={tab === x.id}
              onClick={() => setTab(x.id)}
              className={cn(
                "tap-target flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-sm font-semibold transition-colors",
                tab === x.id ? "bg-card text-primary shadow-soft" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <x.icon className="h-4 w-4" />
              {t(`teacher.${x.id}`)}
            </button>
          ))}
        </div>

        {tab === "myCourses" ? (
          <CourseGrid
            courses={myCourses}
            lessonsPerCourse={(id) => myLessons.filter((l) => l.courseId === id).length}
          />
        ) : null}
        {tab === "attendance" ? (
          <AttendancePanel courses={myCourses} courseId={attendanceCourse} onCourseChange={setAttendanceCourse} />
        ) : null}
        {tab === "submissions" ? (
          <SubmissionsPanel submissions={submissions} courseName={(id) => courseById(id)?.name ?? ""} />
        ) : null}
        {tab === "students" ? <StudentsPanel /> : null}
      </section>
    </div>
  );
}
