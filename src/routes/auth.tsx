import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { useI18n, LANGUAGES } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { roleHome } from "@/components/app/AppShell";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Student TM" },
      { name: "description", content: "Sign in to Student TM with your student ID or email." },
      { property: "og:title", content: "Sign in — Student TM" },
      { property: "og:description", content: "Sign in to Student TM with your student ID or email." },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "register" | "forgot" | "reset";

function AuthPage() {
  const { t, lang, setLang } = useI18n();
  const { login, register, user, ready } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [quickLogin, setQuickLogin] = useState<string | null>(null);

  const roleAccounts = [
    { label: "Студент", email: "student@student.tm", password: "StudentTM2026!", icon: UserRound },
    { label: "Преподаватель", email: "teacher@student.tm", password: "TeacherTM2026!", icon: UsersRound },
    { label: "Администратор", email: "admin@student.tm", password: "AdminTM2026!", icon: ShieldCheck },
  ] as const;

  useEffect(() => {
    if (ready && user) navigate({ to: roleHome(user.role), replace: true });
  }, [ready, user, navigate]);

  const quickSignIn = async (account: (typeof roleAccounts)[number]) => {
    setError("");
    setInfo("");
    setQuickLogin(account.email);
    const res = await login(account.email, account.password, true);
    setQuickLogin(null);
    if (!res.ok) setError("Не удалось войти. Проверьте подключение к серверу.");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (mode === "login") {
      const res = await login(email, password, remember);
      if (!res.ok) setError(t("auth.invalid"));
    } else if (mode === "register") {
      const res = await register(name || email.split("@")[0]!, email, password);
      if (!res.ok) setError(t("auth.invalid"));
    } else if (mode === "forgot") {
      setInfo(t("auth.resetSent"));
      setMode("reset");
    } else {
      setInfo(t("auth.registered"));
      setMode("login");
    }
  };

  const field =
    "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-ring";

  return (
    <div className="flex min-h-screen flex-col bg-muted/40 px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <GraduationCap className="h-7 w-7" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Student TM</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("tagline")}</p>
        </div>

        <form onSubmit={submit} className="card-surface animate-rise space-y-4 p-6">
          <div>
            <h2 className="text-lg font-semibold">
              {mode === "login"
                ? t("auth.title")
                : mode === "register"
                  ? t("auth.register")
                  : mode === "forgot"
                    ? t("auth.forgot")
                    : t("auth.reset")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("auth.subtitle")}</p>
          </div>

          {mode === "register" ? (
            <input className={field} placeholder={t("auth.fullName")} value={name} onChange={(e) => setName(e.target.value)} />
          ) : null}

          {mode !== "reset" ? (
            <input
              className={field}
              type="text"
              autoComplete="username"
              placeholder={t("auth.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          ) : null}

          {mode === "login" || mode === "register" || mode === "reset" ? (
            <input
              className={field}
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder={t("auth.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          ) : null}

          {mode === "login" ? (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                {t("auth.remember")}
              </label>
              <button type="button" onClick={() => setMode("forgot")} className="font-medium text-primary">
                {t("auth.forgot")}
              </button>
            </div>
          ) : null}

          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
          {info ? <p className="text-sm font-medium text-success">{info}</p> : null}

          <button
            type="submit"
            className="tap-target w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {mode === "login" ? t("auth.login") : mode === "register" ? t("auth.register") : t("auth.reset")}
          </button>

          <div className="text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <button type="button" onClick={() => setMode("register")}>
                {t("auth.noAccount")} <span className="font-semibold text-primary">{t("auth.register")}</span>
              </button>
            ) : (
              <button type="button" onClick={() => setMode("login")} className="font-semibold text-primary">
                {t("auth.back")}
              </button>
            )}
          </div>
        </form>

        {mode === "login" ? (
          <div className="mt-4 rounded-2xl border border-border/70 bg-card/70 p-3">
            <p className="mb-2 text-center text-xs font-medium text-muted-foreground">Быстрый вход по роли</p>
            <div className="grid grid-cols-3 gap-2">
              {roleAccounts.map((account) => {
                const Icon = account.icon;
                const isLoading = quickLogin === account.email;
                return (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => void quickSignIn(account)}
                    disabled={quickLogin !== null}
                    className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-background px-2 py-2 text-center text-xs font-semibold transition-colors hover:border-primary hover:bg-primary/10 disabled:cursor-wait disabled:opacity-60"
                    aria-label={`Войти как ${account.label}`}
                  >
                    <Icon className="size-4 text-primary" aria-hidden="true" />
                    <span>{isLoading ? "Вход..." : account.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex justify-center gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${lang === l.code ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
