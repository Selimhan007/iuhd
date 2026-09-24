import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Card, EmptyState, PageHeader, Pill } from "@/components/app/ui-kit";
import { AssignmentCard } from "@/components/app/cards";
import { useI18n } from "@/lib/i18n";
import { assignments as demoAssignments, courseById, teacherOfCourse, type Assignment } from "@/lib/demo-data";
import { Upload, X, CheckCircle2, Paperclip } from "lucide-react";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Assignments — Student TM" },
      { name: "description", content: "Track assignment deadlines, statuses and submissions for every course." },
      { property: "og:title", content: "Assignments — Student TM" },
      { property: "og:description", content: "Track assignment deadlines, statuses and submissions." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<"all" | "open" | "done">("all");
  const [open, setOpen] = useState<Assignment | null>(null);
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [fileName, setFileName] = useState("");

  const list = demoAssignments
    .filter((a) =>
      filter === "all"
        ? true
        : filter === "open"
          ? ["notStarted", "inProgress", "late"].includes(a.status) && !submitted[a.id]
          : ["submitted", "graded"].includes(a.status) || submitted[a.id],
    )
    .sort((a, b) => a.dueInDays - b.dueInDays);

  return (
    <AppShell>
      <PageHeader title={t("tasks.title")} />

      <div className="mb-5 inline-flex rounded-xl bg-muted p-1">
        {(
          [
            ["all", t("home.viewAll")],
            ["open", t("task.inProgress")],
            ["done", t("task.submitted")],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`tap-target rounded-lg px-4 text-sm font-semibold ${filter === k ? "bg-card shadow-soft" : "text-muted-foreground"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState message={t("empty.tasks")} />
      ) : (
        <div className="space-y-3">
          {list.map((a) => (
            <AssignmentCard
              key={a.id}
              a={submitted[a.id] ? { ...a, status: "submitted" } : a}
              onClick={() => {
                setFileName("");
                setOpen(a);
              }}
            />
          ))}
        </div>
      )}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 sm:items-center sm:p-4">
          <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-border bg-card p-5 sm:rounded-3xl">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">{open.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {courseById(open.courseId)?.name} · {teacherOfCourse(open.courseId)?.name}
                </p>
              </div>
              <button onClick={() => setOpen(null)} aria-label={t("close")} className="tap-target">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="mb-3 flex gap-2">
              <Pill tone="primary">
                {open.dueInDays === 1
                  ? t("tasks.dueTomorrow")
                  : `${t("tasks.due")}: ${new Date(Date.now() + open.dueInDays * 86400000).toLocaleDateString()}`}
              </Pill>
              <Pill>{t(`task.${submitted[open.id] ? "submitted" : open.status}`)}</Pill>
            </div>

            <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">{t("tasks.description")}</p>
            <p className="mb-4 text-sm">{open.description}</p>

            {open.attachments.length ? (
              <div className="mb-4 space-y-2">
                {open.attachments.map((f) => (
                  <Card key={f.name} className="flex items-center gap-2 py-3 text-sm">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    {f.name}
                  </Card>
                ))}
              </div>
            ) : null}

            {submitted[open.id] ? (
              <div className="flex items-center gap-2 rounded-xl bg-success/12 px-4 py-3 text-sm font-semibold text-success">
                <CheckCircle2 className="h-4 w-4" /> {t("tasks.submitted")}
              </div>
            ) : (
              <>
                <label className="mb-3 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border px-4 py-4 text-sm text-muted-foreground">
                  <Upload className="h-4 w-4" />
                  {fileName || t("tasks.upload")}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                  />
                </label>
                <button
                  onClick={() => setSubmitted((s) => ({ ...s, [open.id]: true }))}
                  className="tap-target w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                >
                  {t("tasks.submit")}
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
