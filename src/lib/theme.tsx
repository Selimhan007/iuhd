import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Ctx = { dark: boolean; toggle: () => void };
const ThemeCtx = createContext<Ctx>({ dark: false, toggle: () => {} });

const THEME_COLORS = {
  dark: "#161b2b",
  light: "#f8fafc",
} as const;

function applyThemeChrome(isDark: boolean) {
  const color = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";

  let themeColor = document.head.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!themeColor) {
    themeColor = document.createElement("meta");
    themeColor.name = "theme-color";
    document.head.appendChild(themeColor);
  }
  themeColor.content = color;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const saved = localStorage.getItem("stm.theme");
    const isDark = saved === "dark" || (!saved && document.documentElement.classList.contains("dark"));
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
    applyThemeChrome(isDark);
  }, []);

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      localStorage.setItem("stm.theme", next ? "dark" : "light");
      document.documentElement.classList.toggle("dark", next);
      applyThemeChrome(next);
      return next;
    });
  }, []);

  return <ThemeCtx.Provider value={{ dark, toggle }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
