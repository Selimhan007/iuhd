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
  Users,
  X,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/demo-data";
import {
  announcements,
  assignments,
  courses,
  events,
  materials,
  teachers,
  notifications as demoNotifications,
  courseById,
} from "@/lib/demo-data";

type NavItem = { to: string; icon: LucideIcon; key: string; tab?: string };

type RoleKind = "student" | "teacher" | "admin";

const roleKind = (role: Role): RoleKind =>
  role === "teacher" ? "teacher" : role === "admin" || role === "superadmin" ? "admin" : "student";

export const roleHome = (role: Role) => {
  const kind = roleKind(role);
  return kind === "teacher" ? "/teacher" : kind === "admin" ? "/admin" : "/";
};

const ROLE_CONFIG: Record<
  RoleKind,
  { brand: string; icon: LucideIcon; main: NavItem[]; manage?: NavItem[]; more: NavItem[] }
> = {
  student: {
    brand: "Student TM",
    icon: GraduationCap,
    main: [
      { to: "/", icon: Home, key: "nav.home" },
      { to: "/schedule", icon: CalendarDays, key: "nav.schedule" },
      { to: "/courses", icon: BookOpen, key: "nav.courses" },
      { to: "/tasks", icon: ClipboardList, key: "nav.tasks" },
      { to: "/profile", icon: User, key: "nav.profile" },
    ],
    more: [
      { to: "/grades", icon: GraduationCap, key: "nav.grades" },
      { to: "/attendance", icon: CheckSquare, key: "nav.attendance" },
      { to: "/exams", icon: FileText, key: "nav.exams" },
      { to: "/materials", icon: BookOpen, key: "nav.materials" },
      { to: "/announcements", icon: Megaphone, key: "nav.announcements" },
      { to: "/events", icon: CalendarHeart, key: "nav.events" },
      { to: "/notifications", icon: Bell, key: "nav.notifications" },
      { to: "/assistant", icon: Sparkles, key: "nav.ai" },
      { to: "/settings", icon: Settings, key: "nav.settings" },
    ],
  },
  teacher: {
    brand: "Teacher TM",
    icon: Presentation,
    main: [
      { to: "/teacher", icon: Presentation, key: "nav.dashboard" },
      { to: "/schedule", icon: CalendarDays, key: "nav.schedule" },
      { to: "/courses", icon: BookOpen, key: "nav.courses" },
      { to: "/announcements", icon: Megaphone, key: "nav.announcements" },
      { to: "/profile", icon: User, key: "nav.profile" },
    ],
    manage: [
      { to: "/teacher", tab: "myCourses", icon: BookOpen, key: "teacher.myCourses" },
      { to: "/teacher", tab: "attendance", icon: CheckSquare, key: "teacher.attendance" },
      { to: "/teacher", tab: "submissions", icon: ClipboardList, key: "teacher.submissions" },
      { to: "/teacher", tab: "students", icon: Users, key: "teacher.students" },
    ],
    more: [
      { to: "/materials", icon: FileText, key: "nav.materials" },
      { to: "/events", icon: CalendarHeart, key: "nav.events" },
      { to: "/notifications", icon: Bell, key: "nav.notifications" },
      { to: "/assistant", icon: Sparkles, key: "nav.ai" },
      { to: "/settings", icon: Settings, key: "nav.settings" },
    ],
  },
  admin: {
    brand: "Admin TM",
    icon: Shield,
    main: [
      { to: "/admin", icon: Shield, key: "nav.dashboard" },
      { to: "/announcements", icon: Megaphone, key: "nav.announcements" },
      { to: "/events", icon: CalendarHeart, key: "nav.events" },
      { to: "/notifications", icon: Bell, key: "nav.notifications" },
      { to: "/profile", icon: User, key: "nav.profile" },
    ],
    manage: [
      { to: "/admin", tab: "students", icon: GraduationCap, key: "admin.students" },
      { to: "/admin", tab: "teachers", icon: Presentation, key: "admin.teachers" },
      { to: "/admin", tab: "courses", icon: BookOpen, key: "admin.courses" },
      { to: "/admin", tab: "schedule", icon: CalendarDays, key: "admin.schedule" },
      { to: "/admin", tab: "announcements", icon: Megaphone, key: "admin.announcements" },
      { to: "/admin", tab: "events", icon: CalendarHeart, key: "admin.events" },
    ],
    more: [
      { to: "/schedule", icon: CalendarDays, key: "nav.schedule" },
      { to: "/courses", icon: BookOpen, key: "nav.courses" },
      { to: "/settings", icon: Settings, key: "nav.settings" },
    ],
  },
};

export function AppShell({ children, allow }: { children: ReactNode; allow?: Role[] }) {
  const { t } = useI18n();
  const { user, ready, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const currentTab = useRouterState({
    select: (s) => (s.location.search as Record<string, unknown>)["tab"] as string | undefined,
  });
  const [searchOpen, setSearchOpen] = useState(false);

  const allowed = !user || !allow || allow.includes(user.role);

  useEffect(() => {
    if (!ready) return;
    if (!user) navigate({ to: "/auth", replace: true });
    else if (!allowed) navigate({ to: roleHome(user.role), replace: true });
  }, [ready, user, allowed, navigate]);

  const unread = demoNotifications.filter((n) => !n.read).length;

  if (!ready || !user || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">{t("loading")}</div>
    );
  }

  const kind = roleKind(user.role);
  const config = ROLE_CONFIG[kind];
  const BrandIcon = config.icon;
  const home = roleHome(user.role);
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  const navLink = (item: NavItem) => (
    <Link
      key={item.to + (item.tab ?? "")}
      to={item.to}
      search={item.tab ? { tab: item.tab } : {}}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        (item.tab ? pathname === item.to && currentTab === item.tab : isActive(item.to) && !(config.manage && currentTab && pathname === item.to))
          ? "bg-primary-soft text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <item.icon className="h-4.5 w-4.5" />
      {t(item.key)}
    </Link>
  );

  return (
    <div data-role={kind} className="min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-card px-4 py-6 lg:flex">
        <Link to={home} className="mb-6 flex items-center gap-2 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BrandIcon className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-tight">{config.brand}</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              {t(`role.${kind}`)}
            </span>
          </span>
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto" aria-label={t(`role.${kind}`)}>
          {config.main.map(navLink)}
          {config.manage ? (
            <>
              <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("nav.manage")}
              </p>
              {config.manage.map(navLink)}
            </>
          ) : null}
          <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("nav.more")}
          </p>
          {config.more.map(navLink)}
        </nav>

        <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-background p-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate({ to: "/auth", replace: true });
            }}
            aria-label={t("settings.logout")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        {/* Sticky header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
            <Link to={home} className="flex items-center gap-2 lg:hidden">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BrandIcon className="h-4 w-4" />
              </span>
              <span className="font-bold">{config.brand}</span>
            </Link>
            <span className="hidden rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary sm:inline-flex lg:inline-flex">
              {t(`role.${kind}`)}
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
          {config.main.map((item) => (
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
