import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Card, PageHeader } from "@/components/app/ui-kit";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import {
  announcements as demoAnnouncements,
  courses as demoCourses,
  events as demoEvents,
  group,
  lessons,
  students as demoStudents,
  teachers as demoTeachers,
  university,
} from "@/lib/demo-data";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — Student TM" },
      { name: "description", content: "Manage students, teachers, courses, schedule, announcements and events." },
      { property: "og:title", content: "Admin panel — Student TM" },
      { property: "og:description", content: "Manage students, teachers, courses and schedule." },
    ],
  }),
  component: AdminPage,
});

const TABS = ["students", "teachers", "courses", "schedule", "announcements", "events"] as const;

function AdminPage() {
  const { t } = useI18n();
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof TABS)[number]>("students");

  const [students, setStudents] = useState(demoStudents.map((s) => ({ id: s.id, label: s.name, sub: s.studentCode })));
  const [teachers, setTeachers] = useState(demoTeachers.map((x) => ({ id: x.id, label: x.name, sub: x.title })));
  const [courses, setCourses] = useState(
    demoCourses.map((c) => ({ id: c.id, label: c.name, sub: `${c.credits} ${t("courses.credits")}` })),
  );
  const [schedule, setSchedule] = useState(
    lessons.slice(0, 8).map((l) => ({ id: l.id, label: `${l.start} ${l.room}`, sub: group.name })),
  );
  const [anns, setAnns] = useState(demoAnnouncements.map((a) => ({ id: a.id, label: a.title, sub: a.author })));
  const [events, setEvents] = useState(demoEvents.map((e) => ({ id: e.id, label: e.title, sub: e.date })));
  const [newLabel, setNewLabel] = useState("");

  useEffect(() => {
    if (ready && user && user.role !== "admin" && user.role !== "superadmin") navigate({ to: "/", replace: true });
  }, [ready, user, navigate]);

  const state = { students, teachers, courses, schedule, announcements: anns, events } as const;
  const setters = {
    students: setStudents,
    teachers: setTeachers,
    courses: setCourses,
    schedule: setSchedule,
    announcements: setAnns,
    events: setEvents,
  } as const;

  const items = state[tab];
  const setItems = setters[tab];

  return (
    <AppShell>
      <PageHeader title={t("admin.title")} subtitle={university.name} />

      <div className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {[
          [demoStudents.length, t("admin.students")],
          [demoTeachers.length, t("admin.teachers")],
          [demoCourses.length, t("admin.courses")],
        ].map(([n, label]) => (
          <Card key={String(label)} className="text-center">
            <p className="text-2xl font-bold">{n}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </Card>
        ))}
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((x) => (
          <button
            key={x}
            onClick={() => setTab(x)}
            className={`tap-target whitespace-nowrap rounded-xl px-4 text-sm font-semibold ${
              tab === x ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {t(`admin.${x}`)}
          </button>
        ))}
      </div>

      <div className="mb-4 flex gap-2">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder={`${t("admin.add")}…`}
          className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring"
        />
        <button
          onClick={() => {
            if (!newLabel.trim()) return;
            setItems((prev) => [{ id: `new-${Date.now()}`, label: newLabel.trim(), sub: "—" }, ...prev]);
            setNewLabel("");
          }}
          className="tap-target flex items-center gap-1 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> {t("admin.add")}
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <Card key={item.id} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.label}</p>
              <p className="truncate text-xs text-muted-foreground">{item.sub}</p>
            </div>
            <button
              aria-label={t("admin.edit")}
              onClick={() => {
                const next = prompt(t("admin.edit"), item.label);
                if (next)
                  setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, label: next } : x)));
              }}
              className="tap-target flex items-center text-muted-foreground"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              aria-label={t("admin.delete")}
              onClick={() => setItems((prev) => prev.filter((x) => x.id !== item.id))}
              className="tap-target flex items-center text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
