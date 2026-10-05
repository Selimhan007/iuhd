import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { EmptyState, PageHeader } from "@/components/app/ui-kit";
import { EventCard } from "@/components/app/cards";
import { useI18n } from "@/lib/i18n";
import { events } from "@/lib/demo-data";
import { CalendarHeart } from "lucide-react";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — Student TM" },
      { name: "description", content: "Campus events, workshops and conferences with one-tap registration." },
      { property: "og:title", content: "Events — Student TM" },
      { property: "og:description", content: "Campus events with one-tap registration." },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const { t } = useI18n();
  const [registered, setRegistered] = useState<Record<string, boolean>>({});

  return (
    <AppShell allow={["student", "teacher", "admin", "superadmin"]}>
      <PageHeader title={t("nav.events")} />
      {events.length === 0 ? (
        <EmptyState message={t("empty.events")} icon={<CalendarHeart className="h-6 w-6" />} />
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <EventCard
              key={e.id}
              e={e}
              registered={!!registered[e.id]}
              onRegister={() => setRegistered((r) => ({ ...r, [e.id]: true }))}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
