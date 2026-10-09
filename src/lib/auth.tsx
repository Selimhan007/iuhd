import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role } from "./demo-data";
import { currentStudent } from "./demo-data";
import { supabase } from "@/integrations/supabase/client";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  studentCode?: string;
  phone?: string;
}

const DEMO: { email: string; password: string; user: SessionUser }[] = [
  {
    email: "student@student.tm",
    password: "student123",
    user: {
      id: currentStudent.id,
      name: currentStudent.name,
      email: currentStudent.email,
      role: "student",
      studentCode: currentStudent.studentCode,
      phone: currentStudent.phone,
    },
  },
  {
    email: "teacher@student.tm",
    password: "teacher123",
    user: { id: "t1", name: "Gowher Yarashowa", email: "teacher@student.tm", role: "teacher" },
  },
  {
    email: "admin@student.tm",
    password: "admin123",
    user: { id: "adm1", name: "Musa Yazynov", email: "admin@student.tm", role: "admin" },
  },
];

export const DEMO_ACCOUNTS = DEMO.map((d) => ({ email: d.email, password: d.password, role: d.user.role }));

interface AuthCtx {
  user: SessionUser | null;
  ready: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<{ ok: boolean }>;
  register: (name: string, email: string) => void;
  logout: () => void;
  updateUser: (patch: Partial<SessionUser>) => void;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  ready: false,
  login: async () => ({ ok: false }),
  register: () => {},
  logout: () => {},
  updateUser: () => {},
});

const KEY = "stm.session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw) as SessionUser;
        void supabase.auth.getSession().then(({ data }) => {
          if (data.session?.user.email?.toLowerCase() === saved.email.toLowerCase()) setUser(saved);
          else persist(null);
          setReady(true);
        });
        return;
      }
    } catch {
      /* ignore corrupt session */
    }
    setReady(true);
  }, []);

  const persist = (u: SessionUser | null, remember = true) => {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
    if (u) (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(u));
  };

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    const found = DEMO.find(
      (d) => d.email.toLowerCase() === email.trim().toLowerCase() && d.password === password,
    );
    if (!found) return { ok: false };
    const { error } = await supabase.auth.signInWithPassword({ email: found.email, password: `${password}::stm-2026` });
    if (error) return { ok: false };
    setUser(found.user);
    persist(found.user, remember);
    return { ok: true };
  }, []);

  const register = useCallback((name: string, email: string) => {
    const u: SessionUser = { id: `new-${Date.now()}`, name, email, role: "student", studentCode: "TM-2026-NEW" };
    setUser(u);
    persist(u, true);
  }, []);

  const logout = useCallback(() => {
    void supabase.auth.signOut();
    setUser(null);
    persist(null);
  }, []);

  const updateUser = useCallback((patch: Partial<SessionUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      persist(next, !!localStorage.getItem(KEY));
      return next;
    });
  }, []);

  return <Ctx.Provider value={{ user, ready, login, register, logout, updateUser }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
