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
            <div key={label} className="flex items-center justify-between px-4 py-3.5 text-sm font-medium">
              {label} <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </Card>

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
