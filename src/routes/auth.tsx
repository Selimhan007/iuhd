import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, Moon, Sun } from "lucide-react";
import { useI18n, LANGUAGES } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { roleHome } from "@/components/app/AppShell";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Student TM" },
      { name: "description", content: "Sign in to Student TM with your numeric ID." },
      { property: "og:title", content: "Sign in — Student TM" },
      { property: "og:description", content: "Sign in to Student TM with your numeric ID." },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "register" | "forgot" | "reset";

function AuthPage() {
  const { t, lang, setLang } = useI18n();
  const { dark, toggle } = useTheme();
  const { login, register, user, ready } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("login");
  const [id, setId] = useState("1001");
  const [password, setPassword] = useState("student123");
  const [name, setName] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (ready && user) navigate({ to: roleHome(user.role), replace: true });
  }, [ready, user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (mode === "login") {
      const res = await login(id, password, remember);
      if (!res.ok) setError(t("auth.invalid"));
    } else if (mode === "register") {
      const res = await register(name || `Student ${id}`, id, password);
      if (!res.ok) setError(t("auth.invalid"));
      else if (res.needsConfirmation) setInfo("Проверьте электронную почту для подтверждения аккаунта.");
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
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex-1 text-center">
            <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <GraduationCap className="h-7 w-7" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Student TM</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("tagline")}</p>
          </div>
          <button
            type="button"
            onClick={toggle}
            aria-label={dark ? "Включить светлую тему" : "Включить тёмную тему"}
            title={dark ? "Светлая тема" : "Тёмная тема"}
            className="tap-target inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </button>
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
              placeholder="ID или email"
              value={id}
              onChange={(e) => setId(e.target.value)}
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
          <section aria-labelledby="demo-profiles-title" className="card-surface mt-4 p-4">
            <div className="mb-3">
              <h2 id="demo-profiles-title" className="text-sm font-semibold">Демо-профили</h2>
              <p className="text-xs text-muted-foreground">Выберите профиль для быстрого входа</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { label: "Студент", id: "1001", password: "student123" },
                { label: "Преподаватель", id: "1002", password: "teacher123" },
                { label: "Администратор", id: "1003", password: "admin123" },
              ].map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => {
                    setId(profile.id);
                    setPassword(profile.password);
                    setError("");
                  }}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-left text-xs transition-colors hover:border-primary hover:bg-muted"
                >
                  <span className="block font-semibold">{profile.label}</span>
                  <span className="text-muted-foreground">ID {profile.id}</span>
                </button>
              ))}
            </div>
          </section>
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
