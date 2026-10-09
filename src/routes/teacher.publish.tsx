import { createFileRoute } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { StaffPublisher } from "@/components/app/StaffPublisher";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/teacher/publish")({
  head: () => ({
    meta: [
      { title: "Publish to students — Student TM" },
      { name: "description", content: "Send announcements, assignments, events and learning materials to students in real time." },
    ],
  }),
  component: TeacherPublishPage,
});

function TeacherPublishPage() {
  const { t } = useI18n();

  return (
    <AppShell allow={["teacher", "admin"]}>
      <div className="animate-rise space-y-6">
        <section className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft sm:p-7">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Megaphone className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">{t("role.teacher")}</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">{t("nav.publish")}</h1>
              <p className="mt-1 text-sm text-muted-foreground">Новые записи появятся у студентов без перезагрузки.</p>
            </div>
          </div>
        </section>
        <StaffPublisher />
      </div>
    </AppShell>
  );
}
