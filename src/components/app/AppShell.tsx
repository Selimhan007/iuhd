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
  Moon,
  Sun,
  X,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { RoleNav, type NavItem, type RoleKind } from "./role-nav";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import type { Role } from "@/lib/demo-data";
import LatticeLoader from "@/components/ui/LatticeLoader";
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

export const roleKind = (role: Role): RoleKind =>
  role === "teacher" ? "teacher" : role === "admin" || role === "superadmin" ? "admin" : "student";

export const roleHome = (role: Role) => {
  const kind = roleKind(role);
  return kind === "teacher" ? "/teacher" : kind === "admin" ? "/admin" : "/";
};

const ROLE_CONFIG: Record<
  RoleKind,
  { brand: string; icon: LucideIcon; main: NavItem[]; more: NavItem[] }
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
      { to: "/materials", icon: FileText, key: "nav.materials" },
      { to: "/tasks", icon: ClipboardList, key: "nav.tasks" },
      { to: "/grades", icon: GraduationCap, key: "nav.grades" },
      { to: "/attendance", icon: CheckSquare, key: "nav.attendance" },
      { to: "/announcements", icon: Megaphone, key: "nav.announcements" },
    ],
    more: [
      { to: "/events", icon: CalendarHeart, key: "nav.events" },
      { to: "/notifications", icon: Bell, key: "nav.notifications" },
      { to: "/assistant", icon: Sparkles, key: "nav.ai" },
      { to: "/profile", icon: User, key: "nav.profile" },
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
    more: [
      { to: "/schedule", icon: CalendarDays, key: "nav.schedule" },
      { to: "/courses", icon: BookOpen, key: "nav.courses" },
      { to: "/settings", icon: Settings, key: "nav.settings" },
    ],
  },
};

export function AppShell({ children, allow }: { children: ReactNode; allow?: Role[] }) {
  const { t } = useI18n();
  const { dark, toggle } = useTheme();
  const { user, ready, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
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
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100 transition-colors duration-200">
        <LatticeLoader label={t("loading")} pattern="orbit" color="currentColor" cellSize={7} gap={2} fontSize={14} step={90} showTimer={false} />
      </div>
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

  const handleLogout = () => {
    logout();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div data-role={kind} className="min-h-screen bg-background text-foreground">
      <div>
        {/* Sticky header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
            <Link to={home} preload="intent" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BrandIcon className="h-4 w-4" />
              </span>
              <span className="font-bold">{config.brand}</span>
            </Link>
            <span className="hidden rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary sm:inline-flex">
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
            <button
              type="button"
              onClick={toggle}
              aria-label={dark ? "Включить светлую тему" : "Включить ночную тему"}
              title={dark ? "Светлая тема" : "Ночная тема"}
              className="tap-target hidden rounded-xl border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex"
            >
              <span key={dark ? "sun" : "moon"} className="block animate-rise">
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </span>
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

        <main className="mx-auto max-w-6xl px-4 pb-28 pt-5 md:pb-32">
          {children}
        </main>
      </div>

      <RoleNav
        kind={kind}
        main={config.main}
        more={config.more}
        isActive={isActive}
        userName={user.name}
        initials={initials}
        onLogout={handleLogout}
        dark={dark}
        onToggleTheme={toggle}
      />

      {searchOpen ? <SearchOverlay onClose={() => setSearchOpen(false)} /> : null}
    </div>
  );
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    const out: { label: string; hint: string; to: string }[] = [];
    courses.forEach((c) => {
      if (c.name.toLowerCase().includes(query))
        out.push({ label: c.name, hint: t("nav.courses"), to: "/courses" });
    });
    teachers.forEach((tc) => {
      if (tc.name.toLowerCase().includes(query))
        out.push({ label: tc.name, hint: t("schedule.teacher"), to: "/courses" });
    });
    assignments.forEach((a) => {
      if (a.title.toLowerCase().includes(query))
        out.push({
          label: a.title,
          hint: courseById(a.courseId)?.name ?? t("nav.tasks"),
          to: "/tasks",
        });
    });
    materials.forEach((m) => {
      if (m.title.toLowerCase().includes(query))
        out.push({ label: m.title, hint: t("nav.materials"), to: "/materials" });
    });
    announcements.forEach((a) => {
      if (a.title.toLowerCase().includes(query))
        out.push({ label: a.title, hint: t("nav.announcements"), to: "/announcements" });
    });
    events.forEach((e) => {
      if (e.title.toLowerCase().includes(query))
        out.push({ label: e.title, hint: t("nav.events"), to: "/events" });
    });
    return out.slice(0, 12);
  }, [q, t]);

  const suggestions = [courses[0]!.name, courses[1]!.name, "Prepare presentation", "English Week"];

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t("search.placeholder")}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="mx-auto mt-16 w-[min(40rem,92vw)] animate-modal-enter overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search.placeholder")}
            className="h-12 flex-1 bg-transparent text-sm outline-none"
          />
          <button
            onClick={onClose}
            aria-label={t("close")}
            className="tap-target text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {!q ? (
            <>
              <p className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                {t("search.suggestions")}
              </p>
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
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {t("search.noResults")}
            </p>
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
