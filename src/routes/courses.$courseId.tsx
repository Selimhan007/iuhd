import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Card, EmptyState, PageHeader, ProgressBar } from "@/components/app/ui-kit";
import { AnnouncementCard, AssignmentCard, MaterialCard } from "@/components/app/cards";
import { useI18n } from "@/lib/i18n";
import {
  announcements,
  assignments,
  attendance,
  courseById,
  grades,
  materials,
  teacherOfCourse,
} from "@/lib/demo-data";

export const Route = createFileRoute("/courses/$courseId")({
  head: () => ({
    meta: [
      { title: "Course — Student TM" },
      { name: "description", content: "Course overview, materials, assignments, grades and attendance." },
      { property: "og:title", content: "Course — Student TM" },
      { property: "og:description", content: "Course overview, materials, assignments and grades." },
    ],
  }),
  component: CourseDetail,
});

const TABS = ["overview", "materials", "assignments", "grades", "attendance", "announcements"] as const;

function CourseDetail() {
  const { courseId } = useParams({ from: "/courses/$courseId" });
  const { t } = useI18n();
  const [tab, setTab] = useState<(typeof TABS)[number]>("overview");
  const course = courseById(courseId);

  if (!course) {
    return (
      <AppShell>
        <EmptyState message={t("empty.generic")} />
      </AppShell>
    );
  }

  const grade = grades.find((g) => g.courseId === course.id);
  const att = attendance.find((a) => a.courseId === course.id);
  const courseTasks = assignments.filter((a) => a.courseId === course.id);
  const courseMaterials = materials.filter((m) => m.courseId === course.id);

  return (
    <AppShell>
      <PageHeader title={course.name} subtitle={`${teacherOfCourse(course.id)?.name} · ${course.credits} ${t("courses.credits")}`} />

      <div className="mobile-scroll-x mb-5 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((x) => (
          <button
            key={x}
            onClick={() => setTab(x)}
            className={`tap-target whitespace-nowrap rounded-xl px-4 text-sm font-semibold transition-colors ${
              tab === x ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {t(`courses.${x}`)}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="space-y-3">
          <Card>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("courses.progress")}</span>
              <span className="font-semibold">{course.progress}%</span>
            </div>
            <div className="mt-2">
              <ProgressBar value={course.progress} color={course.color} />
            </div>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <p className="text-xs text-muted-foreground">{t("courses.grade")}</p>
              <p className="mt-1 text-2xl font-bold">{grade?.total ?? course.grade}</p>
              <p className="text-sm font-semibold text-primary">{grade?.letter}</p>
            </Card>
            <Card>
              <p className="text-xs text-muted-foreground">{t("courses.attendance")}</p>
              <p className="mt-1 text-2xl font-bold">{att?.percent ?? 0}%</p>
            </Card>
          </div>
        </div>
      ) : null}

      {tab === "materials" ? (
        courseMaterials.length ? (
          <div className="space-y-3">
            {courseMaterials.map((m) => (
              <MaterialCard key={m.id} m={m} />
            ))}
          </div>
        ) : (
          <EmptyState message={t("empty.materials")} />
        )
      ) : null}

      {tab === "assignments" ? (
        courseTasks.length ? (
          <div className="space-y-3">
            {courseTasks.map((a) => (
              <AssignmentCard key={a.id} a={a} />
            ))}
          </div>
        ) : (
          <EmptyState message={t("empty.tasks")} />
        )
      ) : null}

      {tab === "grades" && grade ? (
        <Card className="space-y-3">
          {(["midterm", "final", "assignments", "exams", "total"] as const).map((k) => (
            <div key={k}>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t(`grades.${k}`)}</span>
                <span className="font-semibold">{grade[k]}/100</span>
              </div>
              <div className="mt-1.5">
                <ProgressBar value={grade[k]} color={course.color} />
              </div>
            </div>
          ))}
        </Card>
      ) : null}

      {tab === "attendance" && att ? (
        <div className="space-y-3">
          <Card>
            <p className="text-xs text-muted-foreground">{t("attendance.overall")}</p>
            <p className="mt-1 text-3xl font-bold">{att.percent}%</p>
          </Card>
          <Card className="space-y-2">
            {att.history.map((h) => (
              <div key={h.date} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{h.date}</span>
                <span className="font-medium">{t(`att.${h.status}`)}</span>
              </div>
            ))}
          </Card>
        </div>
      ) : null}

      {tab === "announcements" ? (
        <div className="space-y-3">
          {announcements.slice(0, 3).map((a) => (
            <AnnouncementCard key={a.id} a={a} />
          ))}
        </div>
      ) : null}
    </AppShell>
  );
}
