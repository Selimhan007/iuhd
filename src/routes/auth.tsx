import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { useI18n, LANGUAGES } from "@/lib/i18n";
import { DEMO_ACCOUNTS, useAuth } from "@/lib/auth";
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
  const [email, setEmail] = useState("student@student.tm");
  const [password, setPassword] = useState("student123");
  const [name, setName] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (ready && user) navigate({ to: roleHome(user.role), replace: true });
  }, [ready, user, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (mode === "login") {
      const res = login(email, password, remember);
      if (!res.ok) setError(t("auth.invalid"));
    } else if (mode === "register") {
      register(name || email.split("@")[0]!, email);
      navigate({ to: "/", replace: true });
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
          <img src={logoAsset.url} alt="Student TM" className="mx-auto mb-3 h-16 w-16 rounded-2xl object-cover" />
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

        <div className="card-surface mt-4 p-4">
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{t("auth.demo")}</p>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((d) => (
              <button
                key={d.email}
                onClick={() => {
                  setEmail(d.email);
                  setPassword(d.password);
                  setMode("login");
                }}
                className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm hover:bg-muted"
              >
                <span className="font-medium capitalize">{d.role}</span>
                <span className="text-xs text-muted-foreground">
                  {d.email} · {d.password}
                </span>
              </button>
            ))}
          </div>
        </div>

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
