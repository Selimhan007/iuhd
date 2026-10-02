import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Card, PageHeader } from "@/components/app/ui-kit";
import { LANGUAGES, useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Download, LogOut, ChevronRight, Share2, Copy, Check } from "lucide-react";
import QRCode from "qrcode";

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
  const [installed, setInstalled] = useState(false);
  const [openInfo, setOpenInfo] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const shareUrl = typeof window === "undefined" ? "https://student-tm.app" : window.location.origin;

  useEffect(() => {
    let active = true;
    void QRCode.toDataURL(shareUrl, { width: 220, margin: 2, errorCorrectionLevel: "M" })
      .then((dataUrl) => {
        if (active) setQrCode(dataUrl);
      })
      .catch(() => {
        if (active) setQrCode("");
      });
    return () => {
      active = false;
    };
  }, [shareUrl]);

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const shareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Student TM", text: "Присоединяйтесь к Student TM", url: shareUrl });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    setShareOpen(true);
  };

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as InstallPrompt);
    };
    const availableHandler = (e: Event) => {
      setInstallEvent((e as CustomEvent<InstallPrompt>).detail);
    };
    const pendingInstallEvent = (window as Window & { studentTmInstallEvent?: InstallPrompt }).studentTmInstallEvent;
    if (pendingInstallEvent) setInstallEvent(pendingInstallEvent);
    const installedHandler = () => {
      setInstalled(true);
      setInstallEvent(null);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("student-tm-install-available", availableHandler);
    window.addEventListener("appinstalled", installedHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("student-tm-install-available", availableHandler);
      window.removeEventListener("appinstalled", installedHandler);
    };
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

        {installed ? (
          <Card className="border-primary/20 bg-primary/5 text-sm font-semibold text-primary">
            Student TM was added to your device.
          </Card>
        ) : (
          <Card className="border-primary/15 bg-primary/5">
            <div className="flex items-start gap-3">
              <Download className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Use it like an app on your phone.</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Install availability depends on your browser. Offline mode keeps the demo interface available; no university account data is synchronized.</p>
                {installEvent ? (
                  <button
                    onClick={async () => {
                      await installEvent.prompt();
                      setInstallEvent(null);
                    }}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    <Download className="h-4 w-4" /> Install app
                  </button>
                ) : (
                  <p className="mt-3 text-xs font-medium text-primary">Install app will appear here when your browser supports it.</p>
                )}
              </div>
            </div>
          </Card>
        )}

        <Card>
          <button type="button" onClick={() => void shareApp()} className="flex w-full items-center justify-between text-left">
            <span>
              <span className="block text-sm font-semibold">Поделиться приложением</span>
              <span className="mt-1 block text-xs text-muted-foreground">Отправьте ссылку или покажите QR-код</span>
            </span>
            <Share2 className="h-5 w-5 text-primary" />
          </button>
        </Card>

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

        {shareOpen ? (
          <div className="animate-dialog-backdrop fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 backdrop-blur-sm sm:items-center">
            <div role="dialog" aria-modal="true" aria-labelledby="share-dialog-title" className="animate-dialog-enter relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-2xl">
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-primary/25 via-primary/5 to-transparent" aria-hidden="true" />
              <div className="relative p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                      <Share2 className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h2 id="share-dialog-title" className="text-xl font-bold tracking-tight">Поделиться приложением</h2>
                    <p className="mt-1.5 max-w-sm text-sm leading-5 text-muted-foreground">Пригласите одногруппников в Student TM одним сканированием.</p>
                  </div>
                  <button type="button" onClick={() => setShareOpen(false)} aria-label={t("close")} className="tap-target rounded-full text-2xl leading-none text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">×</button>
                </div>

                <div className="mt-6 grid gap-5 rounded-3xl border border-border/70 bg-muted/40 p-4 sm:grid-cols-[auto_1fr] sm:items-center sm:p-5">
                  <div className="mx-auto rounded-2xl bg-white p-3 shadow-lg shadow-primary/10 ring-4 ring-white/10">
                    {qrCode ? (
                      <img src={qrCode} alt="QR-код для открытия Student TM" width="220" height="220" className="h-44 w-44 sm:h-[180px] sm:w-[180px]" />
                    ) : (
                      <div className="flex h-44 w-44 items-center justify-center text-center text-xs text-muted-foreground sm:h-[180px] sm:w-[180px]">
                        Формируем QR-код…
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 text-center sm:text-left">
                    <p className="text-sm font-semibold">Сканируйте камерой телефона</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">Код откроет приложение сразу, без ручного ввода адреса.</p>
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-left">
                      <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{shareUrl}</span>
                      <button type="button" onClick={() => void copyShareLink()} className="tap-target shrink-0 rounded-lg bg-primary/10 px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/20">
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        <span className="sr-only">{copied ? "Скопировано" : "Копировать ссылку"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <button type="button" onClick={() => setShareOpen(false)} className="mt-5 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.01] active:scale-[0.99]">Готово</button>
              </div>
            </div>
          </div>
        ) : null}

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
