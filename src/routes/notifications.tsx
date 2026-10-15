import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/notifications", { credentials: "include" })
      .then(async (response) => response.ok ? (await response.json()) as { items?: Array<{ id: string; title: string; body: string; kind: string; read_at: string | null; created_at: string }> } : null)
      .then((payload) => {
        if (!active || !payload?.items?.length) return;
        setItems(payload.items.map((item) => ({ id: item.id, kind: item.kind as "announcement" | "event", text: `${item.title}: ${item.body}`, read: Boolean(item.read_at), time: new Date(item.created_at).toLocaleDateString() })));
      })
      .catch(() => undefined)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const unread = items.filter((n) => !n.read).length;
  const visibleItems = filter === "unread" ? items.filter((n) => !n.read) : items;

  return (
    <AppShell>
      <PageHeader
        title={t("nav.notifications")}
        subtitle={`${unread} ${t("notif.unread")}`}
        action={
          unread ? (
            <button
              onClick={async () => { await fetch("/api/notifications", { method: "PATCH", headers: { "content-type": "application/json" }, credentials: "include", body: JSON.stringify({}) }); setItems((prev) => prev.map((n) => ({ ...n, read: true }))); }}
              className="text-sm font-semibold text-primary"
            >
              {t("notif.markAll")}
            </button>
          ) : undefined
        }
      />
      <div className="mb-4 inline-flex rounded-xl bg-muted p-1">
        {([['all', 'All'], ['unread', 'Unread']] as const).map(([value, label]) => <button key={value} onClick={() => setFilter(value)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${filter === value ? "bg-card shadow-soft" : "text-muted-foreground"}`}>{label}{value === "unread" ? ` (${unread})` : ""}</button>)}
      </div>
      {loading ? <p className="py-10 text-center text-sm text-muted-foreground">Loading notifications...</p> : visibleItems.length === 0 ? (
        <EmptyState message={t("empty.notifications")} icon={<Bell className="h-6 w-6" />} />
      ) : (
        <div className="space-y-3">
          {visibleItems.map((n) => (
            <NotificationItem
              key={n.id}
              n={n}
              onRead={async () => { await fetch("/api/notifications", { method: "PATCH", headers: { "content-type": "application/json" }, credentials: "include", body: JSON.stringify({ id: n.id }) }); setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))); }}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
