import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Ctx = { dark: boolean; toggle: () => void };
const ThemeCtx = createContext<Ctx>({ dark: false, toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const saved = localStorage.getItem("stm.theme");
    const isDark = saved === "dark" || (!saved && document.documentElement.classList.contains("dark"));
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      localStorage.setItem("stm.theme", next ? "dark" : "light");
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  return <ThemeCtx.Provider value={{ dark, toggle }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
