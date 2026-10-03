import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { announceInstallAvailability, type InstallPromptEvent } from "../hooks/use-install-prompt";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { I18nProvider } from "../lib/i18n";
import { AuthProvider } from "../lib/auth";
import { ThemeProvider } from "../lib/theme";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Something went wrong. Please try again.
        </h1>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Student TM — University student platform" },
      {
        name: "description",
        content: "Schedule, grades, attendance, assignments and announcements for university students in Turkmenistan.",
      },
      { name: "theme-color", content: "#1e3a8a" },
      { property: "og:title", content: "Student TM" },
      { property: "og:description", content: "Your university, in one app." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/icons/icon-192.png", type: "image/png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icons/icon-192.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="tk">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const theme = localStorage.getItem("stm.theme"); if (theme === "dark") document.documentElement.classList.add("dark"); else if (theme === "light") document.documentElement.classList.remove("dark"); } catch {} })();`,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function InstallPromptBanner() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      const installEvent = event as InstallPromptEvent;
      setInstallEvent(installEvent);
      announceInstallAvailability(installEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!visible || !installEvent) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-md rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:right-6 sm:w-[28rem]">
      <div className="flex items-start gap-3">
        <img src="/icons/icon-512.png" alt="Student TM" className="h-12 w-12 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">Use it like an app on your phone.</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">Install availability depends on your browser. Offline mode keeps the demo interface available; no university account data is synchronized.</p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => { void installEvent.prompt(); setInstallEvent(null); setVisible(false); }} className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">Install app</button>
            <button type="button" onClick={() => setVisible(false)} className="rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted">Not now</button>
          </div>
        </div>
        <button type="button" onClick={() => setVisible(false)} aria-label="Close" className="text-lg leading-none text-muted-foreground">×</button>
      </div>
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            {/* Required: nested routes render here. */}
            <Outlet />
            <InstallPromptBanner />
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
