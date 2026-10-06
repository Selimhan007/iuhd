import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { EmptyState, PageHeader } from "@/components/app/ui-kit";
import { AnnouncementCard } from "@/components/app/cards";
import { useI18n } from "@/lib/i18n";
import { announcements, type AnnCategory } from "@/lib/demo-data";
import { Megaphone } from "lucide-react";

export const Route = createFileRoute("/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements — Student TM" },
      { name: "description", content: "University, faculty, department and group announcements in one feed." },
      { property: "og:title", content: "Announcements — Student TM" },
      { property: "og:description", content: "University and faculty announcements in one feed." },
    ],
  }),
  component: AnnouncementsPage,
});

const CATEGORIES: (AnnCategory | "all")[] = ["all", "university", "faculty", "department", "group", "emergency", "event"];

function AnnouncementsPage() {
  const { t } = useI18n();
  const [cat, setCat] = useState<AnnCategory | "all">("all");

  const list = announcements
    .filter((a) => cat === "all" || a.category === cat)
    .slice()
    .sort((a, b) => Number(!!b.important) - Number(!!a.important) || b.date.localeCompare(a.date));

  return (
    <AppShell allow={["student", "teacher", "admin", "superadmin"]}>
      <PageHeader title={t("nav.announcements")} />

      <div className="mobile-scroll-x mb-5 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`tap-target whitespace-nowrap rounded-xl px-4 text-sm font-semibold ${
              cat === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {c === "all" ? t("home.viewAll") : t(`ann.${c}`)}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState message={t("empty.announcements")} icon={<Megaphone className="h-6 w-6" />} />
      ) : (
        <div className="space-y-3">
          {list.map((a) => (
            <AnnouncementCard key={a.id} a={a} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
