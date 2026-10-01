import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Card, PageHeader } from "@/components/app/ui-kit";
import { LANGUAGES, useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Download, LogOut, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Student TM" },
      { name: "description", content: "Language, dark mode, notifications, security and app information." },
      { property: "og:title", content: "Settings — Student TM" },
      { property: "og:description", content: "Language, dark mode, notifications and security." },
    ],
  }),
  component: SettingsPage,
});

interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
}

function SettingsPage() {
  const { t, lang, setLang } = useI18n();
  const { dark, toggle } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState(true);
  const [installEvent, setInstallEvent] = useState<InstallPrompt | null>(null);
  const [openInfo, setOpenInfo] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as InstallPrompt);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  return (
    <AppShell>
      <PageHeader title={t("nav.settings")} />

      <div className="space-y-4">
        <Card>
          <p className="mb-3 text-sm font-semibold">{t("settings.language")}</p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`tap-target rounded-xl px-4 text-sm font-semibold ${
                  lang === l.code ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <span className="text-sm font-semibold">{t("settings.darkMode")}</span>
          <button
            onClick={toggle}
            role="switch"
            aria-checked={dark}
            aria-label={t("settings.darkMode")}
            className={`h-7 w-12 rounded-full p-1 transition-colors ${dark ? "bg-primary" : "bg-muted"}`}
          >
            <span className={`block h-5 w-5 rounded-full bg-card transition-transform ${dark ? "translate-x-5" : ""}`} />
          </button>
        </Card>

        <Card className="flex items-center justify-between">
          <span className="text-sm font-semibold">{t("settings.notifications")}</span>
          <button
            onClick={() => setNotifs((v) => !v)}
            role="switch"
            aria-checked={notifs}
            aria-label={t("settings.notifications")}
            className={`h-7 w-12 rounded-full p-1 transition-colors ${notifs ? "bg-primary" : "bg-muted"}`}
          >
            <span className={`block h-5 w-5 rounded-full bg-card transition-transform ${notifs ? "translate-x-5" : ""}`} />
          </button>
        </Card>

        {installEvent ? (
          <button
            onClick={() => {
              void installEvent.prompt();
              setInstallEvent(null);
            }}
            className="tap-target flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
          >
            <Download className="h-4 w-4" /> {t("settings.install")}
          </button>
        ) : null}

        <Card className="divide-y divide-border p-0">
          <Link to="/profile" className="flex items-center justify-between px-4 py-3.5 text-sm font-medium">
            {t("nav.profile")} <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          {[
            t("settings.security"),
            t("settings.changePassword"),
            t("settings.about"),
            t("settings.help"),
            t("settings.terms"),
            t("settings.privacy"),
          ].map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setOpenInfo(label)}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-medium transition-colors hover:bg-muted/60"
            >
              {label} <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </Card>

        {openInfo ? (
          <div className="animate-dialog-backdrop fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 p-4 sm:items-center">
            <div role="dialog" aria-modal="true" aria-labelledby="settings-dialog-title" className="animate-dialog-enter w-full max-w-md rounded-2xl bg-card p-5 shadow-xl">
              <div className="flex items-center justify-between gap-4">
                <h2 id="settings-dialog-title" className="text-lg font-semibold">{openInfo}</h2>
                <button type="button" onClick={() => setOpenInfo(null)} aria-label={t("close")} className="tap-target text-muted-foreground">×</button>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {openInfo === t("settings.changePassword")
                  ? "Password changes are handled securely through the sign-in recovery flow."
                  : openInfo === t("settings.security")
                    ? "Your account session is protected. Sign out when using a shared device."
                    : openInfo === t("settings.about")
                      ? "Student TM helps students manage schedules, courses, tasks and academic progress."
                      : openInfo === t("settings.help")
                        ? "For help, check your course information or contact your administrator."
                        : openInfo === t("settings.terms")
                          ? "Use Student TM responsibly and follow your institution's rules."
                          : "Your personal data is used only to provide the Student TM experience."}
              </p>
              <button type="button" onClick={() => setOpenInfo(null)} className="mt-5 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">{t("close")}</button>
            </div>
          </div>
        ) : null}

        <button
          onClick={() => {
            logout();
            navigate({ to: "/auth", replace: true });
          }}
          className="tap-target flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/40 px-4 py-3 text-sm font-semibold text-destructive"
        >
          <LogOut className="h-4 w-4" /> {t("settings.logout")}
        </button>

        <p className="pb-4 text-center text-xs text-muted-foreground">Student TM · v1.0.0</p>
      </div>
    </AppShell>
  );
}
