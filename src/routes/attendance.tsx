import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { Card, PageHeader, Pill, ProgressBar } from "@/components/app/ui-kit";
import { AttendanceCard } from "@/components/app/cards";
import { useI18n } from "@/lib/i18n";
import { attendance, courseById } from "@/lib/demo-data";

export const Route = createFileRoute("/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance — Student TM" },
      { name: "description", content: "Attendance percentage per course and a full attendance history." },
      { property: "og:title", content: "Attendance — Student TM" },
      { property: "og:description", content: "Attendance percentage per course and history." },
    ],
  }),
  component: AttendancePage,
});

const tone: Record<string, string> = { present: "success", absent: "danger", late: "warning", excused: "primary" };

function AttendancePage() {
  const { t } = useI18n();
  const overall = Math.round(attendance.reduce((s, a) => s + a.percent, 0) / attendance.length);
  const history = attendance
    .flatMap((a) => a.history.map((h) => ({ ...h, courseId: a.courseId })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 12);

  return (
    <AppShell allow={["student"]}>
      <PageHeader title={t("nav.attendance")} />

      <Card className="mb-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("attendance.overall")}</p>
        <p className="mt-1 text-4xl font-bold">{overall}%</p>
        <div className="mt-3">
          <ProgressBar value={overall} />
        </div>
      </Card>

      <div className="space-y-3">
        {attendance.map((a) => (
          <AttendanceCard key={a.courseId} courseId={a.courseId} percent={a.percent} />
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("attendance.history")}
      </h2>
      <div className="space-y-2">
        {history.map((h, i) => (
          <Card key={`${h.courseId}-${h.date}-${i}`} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{courseById(h.courseId)?.name}</p>
              <p className="text-xs text-muted-foreground">{h.date}</p>
            </div>
            <Pill tone={tone[h.status] ?? "neutral"}>{t(`att.${h.status}`)}</Pill>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
