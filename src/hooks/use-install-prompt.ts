import { useCallback, useEffect, useState } from "react";

export interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

type InstallWindow = Window & { studentTmInstallEvent?: InstallPromptEvent };

export function useInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const updateEvent = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };
    const installedHandler = () => {
      setInstalled(true);
      setInstallEvent(null);
    };
    const pending = (window as InstallWindow).studentTmInstallEvent;
    if (pending) setInstallEvent(pending);

    window.addEventListener("beforeinstallprompt", updateEvent);
    window.addEventListener("student-tm-install-available", updateEvent);
    window.addEventListener("appinstalled", installedHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", updateEvent);
      window.removeEventListener("student-tm-install-available", updateEvent);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const install = useCallback(async () => {
    if (!installEvent) return false;
    await installEvent.prompt();
    setInstallEvent(null);
    return true;
  }, [installEvent]);

  return { installEvent, installed, install };
}

export function announceInstallAvailability(event: InstallPromptEvent) {
  const installWindow = window as InstallWindow;
  installWindow.studentTmInstallEvent = event;
  window.dispatchEvent(new CustomEvent("student-tm-install-available", { detail: event }));
}
