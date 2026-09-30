import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Home,
  CalendarDays,
  BookOpen,
  ClipboardList,
  User,
  GraduationCap,
  CheckSquare,
  FileText,
  Megaphone,
  CalendarHeart,
  Bell,
  Settings,
  Sparkles,
  Shield,
  Presentation,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { announcements, assignments, courses, events, materials, teachers, notifications as demoNotifications, courseById } from "@/lib/demo-data";

const mainNav = [
  { to: "/", icon: Home, key: "nav.home" },
  { to: "/schedule", icon: CalendarDays, key: "nav.schedule" },
  { to: "/courses", icon: BookOpen, key: "nav.courses" },
  { to: "/tasks", icon: ClipboardList, key: "nav.tasks" },
  { to: "/profile", icon: User, key: "nav.profile" },
] as const;

const moreNav = [
  { to: "/grades", icon: GraduationCap, key: "nav.grades" },
  { to: "/attendance", icon: CheckSquare, key: "nav.attendance" },
  { to: "/exams", icon: FileText, key: "nav.exams" },
  { to: "/materials", icon: BookOpen, key: "nav.materials" },
  { to: "/announcements", icon: Megaphone, key: "nav.announcements" },
  { to: "/events", icon: CalendarHeart, key: "nav.events" },
  { to: "/notifications", icon: Bell, key: "nav.notifications" },
  { to: "/assistant", icon: Sparkles, key: "nav.ai" },
  { to: "/settings", icon: Settings, key: "nav.settings" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (ready && !user) navigate({ to: "/auth", replace: true });
  }, [ready, user, navigate]);

  const unread = demoNotifications.filter((n) => !n.read).length;

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">{t("loading")}</div>
    );
  }

  const roleNav = [
    ...(user.role === "teacher" || user.role === "admin"
      ? [{ to: "/teacher", icon: Presentation, key: "nav.teacher" } as const]
      : []),
    ...(user.role === "admin" || user.role === "superadmin"
      ? [{ to: "/admin", icon: Shield, key: "nav.admin" } as const]
      : []),
  ];

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-card px-4 py-6 lg:flex">
        <Link to="/" className="mb-8 flex items-center gap-2 px-2">
          <img
            src="/icons/icon-512.png"
            alt="Student TM"
            className="h-9 w-9 rounded-xl object-cover"
          />
          <span className="text-lg font-bold tracking-tight">Student TM</span>
        </Link>
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {[...mainNav, ...roleNav, ...moreNav].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(item.to)
                  ? "bg-primary-soft text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4.5 w-4.5" />
              {t(item.key)}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        {/* Sticky header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
            <span className="flex items-center gap-2 lg:hidden">
            <img
              src="/icons/icon-512.png"
              alt="Student TM"
              className="h-8 w-8 rounded-lg object-cover"
            />
            <span className="font-bold">Student TM</span>
            </span>
            <button
              onClick={() => setSearchOpen(true)}
              aria-label={t("search.placeholder")}
              className="tap-target ml-auto flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">{t("search.placeholder")}</span>
            </button>
            <Link
              to="/notifications"
              aria-label={t("nav.notifications")}
              className="tap-target relative flex items-center justify-center rounded-xl border border-border px-3 text-muted-foreground transition-colors hover:bg-muted"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {unread}
                </span>
              ) : null}
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 pb-28 pt-5 lg:pb-12">{children}</main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-between px-2">
          {mainNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "tap-target flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors",
                isActive(item.to) ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {t(item.key)}
            </Link>
          ))}
        </div>
      </nav>

      {searchOpen ? <SearchOverlay onClose={() => setSearchOpen(false)} /> : null}
    </div>
  );
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const out: { label: string; hint: string; to: string }[] = [];
    courses.forEach((c) => {
      if (c.name.toLowerCase().includes(query)) out.push({ label: c.name, hint: t("nav.courses"), to: "/courses" });
    });
    teachers.forEach((tc) => {
      if (tc.name.toLowerCase().includes(query)) out.push({ label: tc.name, hint: t("schedule.teacher"), to: "/courses" });
    });
    assignments.forEach((a) => {
      if (a.title.toLowerCase().includes(query))
        out.push({ label: a.title, hint: courseById(a.courseId)?.name ?? t("nav.tasks"), to: "/tasks" });
    });
    materials.forEach((m) => {
      if (m.title.toLowerCase().includes(query)) out.push({ label: m.title, hint: t("nav.materials"), to: "/materials" });
    });
    announcements.forEach((a) => {
      if (a.title.toLowerCase().includes(query))
        out.push({ label: a.title, hint: t("nav.announcements"), to: "/announcements" });
    });
    events.forEach((e) => {
      if (e.title.toLowerCase().includes(query)) out.push({ label: e.title, hint: t("nav.events"), to: "/events" });
    });
    return out.slice(0, 12);
  }, [q, t]);

  const suggestions = [courses[0]!.name, courses[1]!.name, "Prepare presentation", "English Week"];

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="mx-auto mt-16 w-[min(40rem,92vw)] overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search.placeholder")}
            className="h-12 flex-1 bg-transparent text-sm outline-none"
          />
          <button onClick={onClose} aria-label={t("close")} className="tap-target text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {!q ? (
            <>
              <p className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">{t("search.suggestions")}</p>
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setQ(s)}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </>
          ) : results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">{t("search.noResults")}</p>
          ) : (
            results.map((r, i) => (
              <Link
                key={`${r.label}-${i}`}
                to={r.to}
                onClick={onClose}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-muted"
              >
                <span className="font-medium">{r.label}</span>
                <span className="text-xs text-muted-foreground">{r.hint}</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
