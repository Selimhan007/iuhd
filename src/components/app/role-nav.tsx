import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { LayoutGrid, LogOut, Moon, Sun, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export type NavItem = { to: string; icon: LucideIcon; key: string };
export type RoleKind = "student" | "teacher" | "admin";

interface RoleNavProps {
  kind: RoleKind;
  main: NavItem[];
  more: NavItem[];
  isActive: (to: string) => boolean;
  userName: string;
  initials: string;
  onLogout: () => void;
  dark: boolean;
  onToggleTheme: () => void;
}

const ACTIVE_STYLES: Record<RoleKind, { phone: string; dock: string; indicator: string }> = {
  student: {
    phone: "bg-primary-soft text-primary",
    dock: "bg-primary text-primary-foreground",
    indicator: "rounded-full",
  },
  teacher: {
    phone: "text-primary",
    dock: "bg-primary-soft text-primary ring-1 ring-primary/40",
    indicator: "rounded-xl",
  },
  admin: {
    phone: "bg-primary text-primary-foreground",
    dock: "bg-primary text-primary-foreground",
    indicator: "rounded-lg",
  },
};

export function RoleNav({
  kind,
  main,
  more,
  isActive,
  userName,
  initials,
  onLogout,
  dark,
  onToggleTheme,
}: RoleNavProps) {
  const { t } = useI18n();
  const [sheetOpen, setSheetOpen] = useState(false);
  const styles = ACTIVE_STYLES[kind];

  // Keep the admin's key destinations visible in the mobile bottom navigation.
  const phoneItems = (kind === "admin" ? main : [main[0], main[1], main[2], main[4]]).filter(Boolean) as NavItem[];
  const phoneSheet = (kind === "admin" ? more : [main[3], ...more]).filter(Boolean) as NavItem[];
  const moreActive = more.some((m) => isActive(m.to));

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheetOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  return (
    <>
      {/* Phone: full-width tab bar */}
      <nav
        aria-label={t(`role.${kind}`)}
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_28px_rgb(15_23_42/0.10)] backdrop-blur-xl dark:shadow-[0_-8px_28px_rgb(0_0_0/0.28)] md:hidden"
      >
        {kind === "teacher" ? <div className="h-0.5 w-full bg-primary/60" aria-hidden /> : null}
        <div className="flex items-stretch justify-between gap-1 px-2.5 py-2">
          {phoneItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                preload="intent"
                aria-current={active ? "page" : undefined}
                className={cn(
                  "tap-target flex flex-1 flex-col items-center justify-center gap-1 py-1.5 text-[11px] font-medium transition-colors",
                  styles.indicator,
                  active ? `${styles.phone} animate-nav-active` : "text-muted-foreground",
                )}
              >
                <item.icon className="h-5 w-5 transition-transform duration-150 group-active:scale-95" />
                <span className="max-w-full truncate px-1">{t(item.key)}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setSheetOpen(true)}
            aria-expanded={sheetOpen}
            className={cn(
              "tap-target flex flex-1 flex-col items-center justify-center gap-1 py-1.5 text-[11px] font-medium transition-colors",
              styles.indicator,
              phoneSheet.some((m) => isActive(m.to)) ? styles.phone : "text-muted-foreground",
            )}
          >
            <LayoutGrid className="h-5 w-5" />
            {t("nav.more")}
          </button>
        </div>
      </nav>

      {/* Tablet: floating dock with labels */}
      <nav
        aria-label={t("nav.main")}
        className="fixed inset-x-0 bottom-4 z-30 hidden justify-center px-4 md:flex lg:hidden"
      >
        <div className="flex items-center gap-1 rounded-2xl border border-white/25 bg-background/55 p-1.5 shadow-[0_16px_45px_rgb(15_23_42/0.16)] backdrop-blur-2xl supports-[backdrop-filter]:bg-background/45 dark:border-white/10 dark:shadow-[0_16px_45px_rgb(0_0_0/0.35)]">
          {main.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                preload="intent"
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium transition-colors",
                  styles.indicator,
                  active
                    ? styles.dock
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="h-4.5 w-4.5" />
                {t(item.key)}
              </Link>
            );
          })}
          <span className="mx-1 h-6 w-px bg-border" aria-hidden />
          <button
            onClick={() => setSheetOpen(true)}
            aria-expanded={sheetOpen}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium transition-colors",
              styles.indicator,
              moreActive
                ? styles.dock
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <LayoutGrid className="h-4.5 w-4.5" />
            {t("nav.more")}
          </button>
        </div>
      </nav>

      {/* Desktop: wide dock with every section */}
      <nav
        aria-label={t(`role.${kind}`)}
        className="fixed inset-x-0 bottom-5 z-30 hidden justify-center px-6 lg:flex"
      >
        <div className="flex items-center gap-1 rounded-2xl border border-white/25 bg-background/55 p-2 shadow-[0_18px_55px_rgb(15_23_42/0.18)] backdrop-blur-2xl supports-[backdrop-filter]:bg-background/45 dark:border-white/10 dark:shadow-[0_18px_55px_rgb(0_0_0/0.38)]">
          {[...main, ...more].map((item, i) => {
            const active = isActive(item.to);
            return (
              <div key={item.to} className="flex items-center">
                {i === main.length ? (
                  <span className="mx-1.5 h-7 w-px bg-border" aria-hidden />
                ) : null}
                <Link
                  to={item.to}
                  title={t(item.key)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors",
                    styles.indicator,
                    active
                      ? styles.dock
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4.5 w-4.5 shrink-0" />
                  <span className={cn(active ? "inline" : "sr-only")}>{t(item.key)}</span>
                </Link>
              </div>
            );
          })}
          <span className="mx-1.5 h-7 w-px bg-border" aria-hidden />
          <span
            title={userName}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary"
          >
            {initials}
          </span>
          <button
            onClick={onLogout}
            title={t("settings.logout")}
            aria-label={t("settings.logout")}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </nav>

      {sheetOpen ? (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t("nav.more")}
        >
          <button
            aria-label={t("close")}
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
          />
          <div className="absolute inset-x-0 bottom-0 animate-sheet-enter overscroll-contain rounded-t-3xl border-t border-white/25 bg-background/70 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-[0_-18px_60px_rgb(15_23_42/0.2)] backdrop-blur-2xl supports-[backdrop-filter]:bg-background/55 dark:border-white/10 dark:shadow-[0_-18px_60px_rgb(0_0_0/0.4)] md:inset-x-auto md:bottom-24 md:left-1/2 md:w-[32rem] md:-translate-x-1/2 md:rounded-3xl md:border">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                  {initials}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">{userName}</p>
                  <p className="text-xs text-primary">{t(`role.${kind}`)}</p>
                </div>
              </div>
              <button
                onClick={() => setSheetOpen(false)}
                aria-label={t("close")}
                className="tap-target flex items-center justify-center rounded-xl text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {phoneSheet.map((item) => {
                const active = isActive(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSheetOpen(false)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border px-2 py-3 text-center text-xs font-medium transition-colors",
                      active
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {t(item.key)}
                  </Link>
                );
              })}
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-pressed={dark}
              aria-label={dark ? "Включить светлую тему" : "Включить ночную тему"}
              className="tap-target mb-2 flex w-full items-center justify-between rounded-2xl border border-border bg-card/70 px-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <span className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </span>
                <span>{dark ? "Светлая тема" : "Ночная тема"}</span>
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "relative flex h-6 w-11 items-center rounded-full p-1 transition-colors",
                  dark ? "bg-primary" : "bg-muted",
                )}
              >
                <span
                  className={cn(
                    "size-4 rounded-full bg-background shadow-sm transition-transform",
                    dark ? "translate-x-5" : "translate-x-0",
                  )}
                />
              </span>
            </button>
            <button
              onClick={() => {
                setSheetOpen(false);
                onLogout();
              }}
              className="tap-target mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold text-destructive"
            >
              <LogOut className="h-4 w-4" />
              {t("settings.logout")}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
