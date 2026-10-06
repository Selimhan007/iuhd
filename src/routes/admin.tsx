import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  Archive,
  Bell,
  CalendarPlus,
  CheckCircle2,
  Download,
  FileWarning,
  GraduationCap,
  LayoutDashboard,
  History,
  Mail,
  Megaphone,
  Presentation,
  Settings2,
  Shield,
  SlidersHorizontal,
  Upload,
  UserRoundCog,
  Users,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { ResourceManager, type ResourceItem } from "@/components/admin/resource-manager";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  announcements as demoAnnouncements,
  events as demoEvents,
  faculty,
  group,
  students as demoStudents,
  teachers as demoTeachers,
  university,
  type Announcement,
  type UniEvent,
} from "@/lib/demo-data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — Student TM" },
      {
        name: "description",
        content: "Manage students, teachers, announcements and events.",
      },
      { property: "og:title", content: "Admin panel — Student TM" },
      { property: "og:description", content: "Manage students, teachers, announcements and events." },
    ],
  }),
  component: AdminPage,
});

type TabId = "students" | "teachers";
type AdminPanel = "overview" | "content" | "control";
type ContentKind = "announcement" | "event";

function AdminPage() {
  return (
    <AppShell allow={["admin", "superadmin"]}>
      <AdminConsole />
    </AppShell>
  );
}

function AdminConsole() {
  const { t } = useI18n();
  const [tab, setTab] = useState<TabId>("students");
  const [panel, setPanel] = useState<AdminPanel>("overview");
  const [publishedAnnouncements, setPublishedAnnouncements] = useState(() => [...demoAnnouncements]);
  const [publishedEvents, setPublishedEvents] = useState(() => [...demoEvents]);

  const [data, setData] = useState<Record<TabId, ResourceItem[]>>(() => ({
    students: demoStudents.map((s) => ({
      id: s.id,
      label: s.name,
      sub: `${s.studentCode} · ${group.name}`,
    })),
    teachers: demoTeachers.map((x) => ({
      id: x.id,
      label: x.name,
      sub: `${x.title} · ${x.email}`,
    })),
  }));

  const stats: { id: TabId; value: number; icon: LucideIcon; label: string }[] = [
    {
      id: "students",
      value: data.students.length,
      icon: GraduationCap,
      label: t("admin.students"),
    },
    { id: "teachers", value: data.teachers.length, icon: Presentation, label: t("admin.teachers") },
  ];

  const monitoring = [
    {
      label: "Işjeň talyplar",
      value: data.students.length,
      detail: "Toparda hasaba alnan",
      icon: Users,
      tone: "text-primary",
    },
    {
      label: "Çap edilen mazmun",
      value: demoAnnouncements.length + demoEvents.length,
      detail: "Bildirişler we çäreler",
      icon: CheckCircle2,
      tone: "text-success",
    },
  ];

  return (
    <div className="animate-rise space-y-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-card sm:flex-row sm:items-center">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Shield className="h-7 w-7" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            {t("admin.title")}
          </p>
          <h1 className="mt-1 text-balance text-2xl font-bold tracking-tight">{university.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("admin.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-medium sm:flex-col sm:items-end">
          <span className="rounded-full bg-primary-soft px-3 py-1 text-primary">
            {university.shortName}
          </span>
          <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
            {faculty.name}
          </span>
        </div>
      </section>

      <nav aria-label="Admin dashboard sections" className="flex gap-2 overflow-x-auto rounded-2xl border border-border bg-card p-2 shadow-card">
        {[
          ["overview", "Gysgaça syn", LayoutDashboard],
          ["content", "Bildirişler we çäreler", Megaphone],
          ["control", "Dolandyryş merkezi", Settings2],
        ].map(([id, label, Icon]) => (
          <button
            key={id as string}
            type="button"
            onClick={() => setPanel(id as AdminPanel)}
            aria-current={panel === id ? "page" : undefined}
            className={cn(
              "flex min-w-[9.5rem] flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition-all",
              panel === id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="truncate">{label as string}</span>
          </button>
        ))}
      </nav>

      {panel === "overview" ? <>
      <section
        aria-label={t("admin.overview")}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
      >
        {stats.map((s) => (
          <button
            key={s.id}
            onClick={() => setTab(s.id)}
            aria-pressed={tab === s.id}
            className={cn(
              "card-surface flex flex-col items-start p-4 text-left transition-colors hover:border-primary/50",
              tab === s.id && "border-primary ring-1 ring-primary",
            )}
          >
            <s.icon className="h-5 w-5 text-primary" />
            <span className="mt-3 text-2xl font-bold leading-none">{s.value}</span>
            <span className="mt-1 w-full truncate text-xs text-muted-foreground">{s.label}</span>
          </button>
        ))}
      </section>

      <section aria-label="System monitoring" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {monitoring.map((item) => (
          <div key={item.label} className="card-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {item.label}
              </span>
              <item.icon className={cn("h-4 w-4", item.tone)} />
            </div>
            <p className="mt-3 text-2xl font-bold">{item.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
          </div>
        ))}
      </section>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1">
          <ResourceManager
            key={tab}
            title={t(`admin.${tab}`)}
            items={data[tab]}
            onChange={(next) => setData((d) => ({ ...d, [tab]: next }))}
          />
        </div>
      </div>
      </> : null}

      {panel === "content" ? (
        <ContentPublisher
          announcements={publishedAnnouncements}
          events={publishedEvents}
          onAnnouncement={(item) => setPublishedAnnouncements((current) => [item, ...current])}
          onEvent={(item) => setPublishedEvents((current) => [item, ...current])}
        />
      ) : null}

      {panel === "control" ? <AdminOperations /> : null}
    </div>
  );
}

function ContentPublisher({
  announcements,
  events,
  onAnnouncement,
  onEvent,
}: {
  announcements: Announcement[];
  events: UniEvent[];
  onAnnouncement: (item: Announcement) => void;
  onEvent: (item: UniEvent) => void;
}) {
  const [kind, setKind] = useState<ContentKind>("announcement");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [date, setDate] = useState("");
  const [place, setPlace] = useState("");
  const [published, setPublished] = useState(false);

  const reset = () => {
    setTitle("");
    setBody("");
    setDate("");
    setPlace("");
    setPublished(true);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !body.trim()) return;
    const id = `admin-${Date.now()}`;
    if (kind === "announcement") {
      onAnnouncement({ id, title: title.trim(), body: body.trim(), author: "Dolandyryş", date: date || new Date().toISOString().slice(0, 10), category: "university" });
    } else {
      onEvent({ id, title: title.trim(), description: body.trim(), date: date || new Date().toISOString().slice(0, 10), place: place.trim() || "Campus" });
    }
    reset();
  };

  return (
    <section className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
              {kind === "announcement" ? <Bell className="h-5 w-5" /> : <CalendarPlus className="h-5 w-5" />}
            </span>
            <div>
              <h2 className="font-bold">Mazmun çap et</h2>
              <p className="text-xs text-muted-foreground">Täzelikleri talyplar we mugallymlar bilen paýlaşyň.</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {([['announcement', 'Bildiriş'], ['event', 'Çäre']] as const).map(([value, label]) => (
              <button key={value} type="button" onClick={() => setKind(value)} className={cn("rounded-xl px-3 py-2.5 text-sm font-semibold", kind === value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{label}</button>
            ))}
          </div>
          <label className="mt-4 block text-sm font-medium">At<input required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 font-normal" /></label>
          <label className="mt-3 block text-sm font-medium">{kind === "announcement" ? "Habar" : "Düşündiriş"}<textarea required value={body} onChange={(e) => setBody(e.target.value)} rows={4} className="mt-1.5 w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 font-normal" /></label>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium">Sene<input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 font-normal" /></label>
            {kind === "event" ? <label className="text-sm font-medium">Ýer<input value={place} onChange={(e) => setPlace(e.target.value)} className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 font-normal" /></label> : null}
          </div>
          <button type="submit" className="mt-4 flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"><Megaphone className="h-4 w-4" /> Çap et</button>
          {published ? <p className="mt-3 text-xs font-medium text-success">Üstünlikli çap edildi.</p> : null}
        </form>
        <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-bold">Çap edilen mazmun</h2>
          <div className="mt-4 space-y-2">
            {[...announcements.slice(0, 4).map((item) => ({ ...item, kind: "Announcement" })), ...events.slice(0, 4).map((item) => ({ ...item, kind: "Event", body: item.description }))].map((item) => (
              <article key={item.id} className="rounded-2xl bg-muted/50 p-3"><div className="flex items-center justify-between gap-3"><p className="font-semibold">{item.title}</p><span className="text-[11px] text-primary">{item.kind}</span></div><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.body}</p></article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const adminSections = [
  { id: "users", label: "Ulanyjylar", icon: UserRoundCog },
  { id: "groups", label: "Toparlar we dersler", icon: Users },
  { id: "audit", label: "Gözegçilik we moderasiýa", icon: History },
  { id: "bulk", label: "Köpçülikleýin amallar", icon: SlidersHorizontal },
  { id: "integrations", label: "Integrasiýalar", icon: Bell },
  { id: "settings", label: "Ulgam sazlamalary", icon: Settings2 },
] as const;

function AdminOperations() {
  const [section, setSection] = useState<(typeof adminSections)[number]["id"]>("users");
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [fileLimit, setFileLimit] = useState("25");
  const [theme, setTheme] = useState("system");
  const [integrations, setIntegrations] = useState({ calendar: false, email: true, push: true });
  const users = [
    { name: "M. Atayev", role: "Student", group: "1B", status: "Active" },
    { name: "G. Nurygdyyev", role: "Teacher", group: "Software", status: "Active" },
    { name: "S. Ovezova", role: "Student", group: "1B", status: "Blocked" },
  ];
  const events = [
    "G. Nurygdyyev uploaded lecture-04.pdf",
    "Admin changed S. Ovezova role to Student",
    "M. Atayev submitted Lab report: loops",
    "Archive request for Group 1B was reviewed",
  ];

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
      <div className="border-b border-border p-4 sm:p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Dolandyryş
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight">Dolandyryş merkezi</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Girişi, mazmuny, amallary we ulgam düzgünlerini bir ýerden dolandyryň.
            </p>
          </div>
          {section === "users" ? (
            <div className="relative sm:w-64">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ulanyjylary gözle"
                aria-label="Ulanyjylary gözle"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 pl-9 text-sm outline-none focus:border-ring"
              />
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          ) : null}
        </div>
        <nav
          aria-label="Dolandyryş bölümleri"
          className="mt-4 flex gap-2 overflow-x-auto pb-1"
        >
          {adminSections.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                section === item.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </button>
          ))}
        </nav>
      </div>

      {section === "users" ? (
        <div className="divide-y divide-border">
          <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
            {["1,248 users", "42 teachers", "18 blocked"].map((label, index) => (
              <div key={label} className="rounded-2xl bg-muted/60 p-3">
                <p className="text-lg font-bold">{label.split(" ")[0]}</p>
                <p className="text-xs text-muted-foreground">
                  {label.slice(label.indexOf(" ") + 1)}
                  {index === 2 ? " · barlamak gerek" : ""}
                </p>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Ulanyjy</th>
                  <th className="px-5 py-3">Rol</th>
                  <th className="px-5 py-3">Topar</th>
                  <th className="px-5 py-3">Ýagdaý</th>
                  <th className="px-5 py-3">Hereketler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users
                  .filter((user) =>
                    `${user.name} ${user.role} ${user.group}`
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  .map((user) => (
                    <tr key={user.name}>
                      <td className="px-5 py-3 font-medium">{user.name}</td>
                      <td className="px-5 py-3 text-muted-foreground">{user.role}</td>
                      <td className="px-5 py-3 text-muted-foreground">{user.group}</td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2 py-1 text-xs font-semibold",
                            user.status === "Blocked"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-success/10 text-success",
                          )}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => setSaved(true)}
                          className="rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold hover:bg-primary-soft"
                        >
                          Roly üýtget
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2 p-4 sm:p-5">
            <button
              onClick={() => setSaved(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <Upload className="h-4 w-4" /> Ulanyjylary import et
            </button>
            <button
              onClick={() => setSaved(true)}
              className="flex items-center gap-2 rounded-xl bg-muted px-4 py-2.5 text-sm font-semibold"
            >
              <Download className="h-4 w-4" /> CSV eksport et
            </button>
            {saved ? (
              <span className="self-center text-xs font-medium text-success">
                Hereket nobata goşuldy.
              </span>
            ) : null}
          </div>
        </div>
      ) : section === "groups" ? (
        <ActionGrid
          items={[
            "Topar döret",
            "Topary arhiwle",
            "Talyplary geçir",
            "Mugallym belle",
            "Ders döret",
            "Sanawy eksport et",
          ]}
        />
      ) : section === "audit" ? (
        <div className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:p-5">
          <div className="space-y-2">
            {events.map((event, index) => (
              <div key={event} className="flex items-start gap-3 rounded-2xl bg-muted/50 p-3">
                <History className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">{event}</p>
                  <p className="text-xs text-muted-foreground">
                    {index + 1} sagat öň · ulgam gözegçiligi
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4">
            <FileWarning className="h-5 w-5 text-warning" />
            <p className="mt-3 text-sm font-semibold">3 elemente moderasiýa gerek</p>
            <button
              onClick={() => setSaved(true)}
              className="mt-3 rounded-lg bg-warning px-3 py-2 text-xs font-semibold text-warning-foreground"
            >
              Barlag nobaty
            </button>
          </div>
        </div>
      ) : section === "bulk" ? (
        <ActionGrid
          items={[
            "Saýlanan toparlara habar ber",
            "Bahalary XLSX eksport et",
            "Köne toparlary arhiwle",
            "Faýllary köpçülikleýin barla",
            "Möhlet ýatlatmasyny iber",
            "Hereket gündeligini ýükle",
          ]}
        />
      ) : section === "integrations" ? (
        <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
          <IntegrationCard
            icon={CalendarDays}
            title="Senenama"
            description="Sapaklary, möhletleri we uniwersitet çärelerini sinhronlaň."
            enabled={integrations.calendar}
            actionLabel={integrations.calendar ? "Birikdirildi" : "Senenamany birikdir"}
            onToggle={() => setIntegrations((current) => ({ ...current, calendar: !current.calendar }))}
          />
          <IntegrationCard
            icon={Mail}
            title="Email notifications"
            description="Send digest emails for new content and grades."
            enabled={integrations.email}
            actionLabel={integrations.email ? "Enabled" : "Enable email"}
            onToggle={() => setIntegrations((current) => ({ ...current, email: !current.email }))}
          />
          <IntegrationCard
            icon={Bell}
            title="Push notifications"
            description="Notify students instantly about important changes."
            enabled={integrations.push}
            actionLabel={integrations.push ? "Enabled" : "Enable push"}
            onToggle={() => setIntegrations((current) => ({ ...current, push: !current.push }))}
          />
        </div>
      ) : (
        <div className="grid gap-4 p-4 sm:grid-cols-3 sm:p-5">
          <label className="text-sm font-medium">
            Theme
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2.5 font-normal"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            Max file size (MB)
            <input
              value={fileLimit}
              onChange={(e) => setFileLimit(e.target.value.replace(/[^0-9]/g, ""))}
              className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2.5 font-normal"
            />
          </label>
          <div className="flex items-end">
            <button
              onClick={() => setSaved(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <Settings2 className="h-4 w-4" /> Save policy
            </button>
          </div>
          {saved ? (
            <p className="text-xs font-medium text-success sm:col-span-3">
              Settings saved. Changes will apply to new uploads.
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}

function IntegrationCard({
  icon: Icon,
  title,
  description,
  enabled,
  actionLabel,
  onToggle,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  enabled: boolean;
  actionLabel: string;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", enabled ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground")}>
          <Icon className="h-5 w-5" />
        </span>
        <span className={cn("rounded-full px-2 py-1 text-[11px] font-semibold", enabled ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
          {enabled ? "Active" : "Off"}
        </span>
      </div>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-1 min-h-10 text-xs leading-5 text-muted-foreground">{description}</p>
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "mt-4 w-full rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors",
          enabled ? "bg-muted text-foreground hover:bg-muted/70" : "bg-primary text-primary-foreground hover:bg-primary/90",
        )}
      >
        {actionLabel}
      </button>
    </div>
  );
}

function ActionGrid({ items }: { items: string[] }) {
  return (
    <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
      {items.map((item, index) => (
        <button
          key={item}
          onClick={() => window.alert(`${item} is ready to configure.`)}
          className="group flex items-center justify-between rounded-2xl border border-border bg-background p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-card"
        >
          <span>
            <span className="block text-sm font-semibold">{item}</span>
            <span className="mt-1 block text-xs text-muted-foreground">
              Open workflow and review changes
            </span>
          </span>
          {index % 2 ? (
            <Archive className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
          ) : (
            <Settings2 className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
          )}
        </button>
      ))}
    </div>
  );
}
