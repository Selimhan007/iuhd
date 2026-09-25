import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { EmptyState, PageHeader } from "@/components/app/ui-kit";
import { NotificationItem } from "@/components/app/cards";
import { useI18n } from "@/lib/i18n";
import { notifications as demoNotifications } from "@/lib/demo-data";
import { Bell } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Student TM" },
      { name: "description", content: "Deadlines, grades, schedule changes, exams and announcements in one place." },
      { property: "og:title", content: "Notifications — Student TM" },
      { property: "og:description", content: "Deadlines, grades and schedule changes in one place." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { t } = useI18n();
  const [items, setItems] = useState(demoNotifications);
  const unread = items.filter((n) => !n.read).length;

  return (
    <AppShell>
      <PageHeader
        title={t("nav.notifications")}
        subtitle={`${unread} ${t("notif.unread")}`}
        action={
          unread ? (
            <button
              onClick={() => setItems((prev) => prev.map((n) => ({ ...n, read: true })))}
              className="text-sm font-semibold text-primary"
            >
              {t("notif.markAll")}
            </button>
          ) : undefined
        }
      />
      {items.length === 0 ? (
        <EmptyState message={t("empty.notifications")} icon={<Bell className="h-6 w-6" />} />
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <NotificationItem
              key={n.id}
              n={n}
              onRead={() => setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
