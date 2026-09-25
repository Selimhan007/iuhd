import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Card, EmptyState, PageHeader, Pill } from "@/components/app/ui-kit";
import { StudentCard } from "@/components/app/cards";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { assignments, courses, group, students } from "@/lib/demo-data";

export const Route = createFileRoute("/teacher")({
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

const TABS = ["myCourses", "students", "submissions"] as const;

function TeacherPage() {
  const { t } = useI18n();
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof TABS)[number]>("myCourses");
  const [graded, setGraded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (ready && user && user.role !== "teacher" && user.role !== "admin") navigate({ to: "/", replace: true });
  }, [ready, user, navigate]);

  const myCourses = courses.filter((c) => c.teacherId === (user?.role === "teacher" ? user.id : c.teacherId));
  const submissions = assignments.filter((a) => a.status === "submitted" || a.status === "graded").slice(0, 6);

  return (
    <AppShell>
      <PageHeader title={t("teacher.title")} subtitle={`${t("teacher.groups")}: ${group.name}`} />

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((x) => (
          <button
            key={x}
            onClick={() => setTab(x)}
            className={`tap-target whitespace-nowrap rounded-xl px-4 text-sm font-semibold ${
              tab === x ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {t(`teacher.${x}`)}
          </button>
        ))}
      </div>

      {tab === "myCourses" ? (
        myCourses.length === 0 ? (
          <EmptyState message={t("empty.generic")} />
        ) : (
          <div className="space-y-3">
            {myCourses.map((c) => (
              <Card key={c.id} className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {group.name} · {students.length} {t("teacher.students")}
                  </p>
                </div>
                <button className="tap-target rounded-xl bg-muted px-3 text-xs font-semibold">
                  {t("teacher.markAttendance")}
                </button>
              </Card>
            ))}
          </div>
        )
      ) : null}

      {tab === "students" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {students.map((s) => (
            <StudentCard key={s.id} s={s} />
          ))}
        </div>
      ) : null}

      {tab === "submissions" ? (
        <div className="space-y-3">
          {submissions.map((a) => (
            <Card key={a.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">{students[1]?.name}</p>
              </div>
              {graded[a.id] || a.status === "graded" ? (
                <Pill tone="success">{a.score ?? 90}/100</Pill>
              ) : (
                <button
                  onClick={() => setGraded((g) => ({ ...g, [a.id]: true }))}
                  className="tap-target rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground"
                >
                  {t("teacher.gradeIt")}
                </button>
              )}
            </Card>
          ))}
        </div>
      ) : null}
    </AppShell>
  );
}
