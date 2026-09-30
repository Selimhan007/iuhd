import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role } from "./demo-data";
import { currentStudent } from "./demo-data";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  studentCode?: string;
  phone?: string;
  staffCode?: string;
  office?: string;
  officeHours?: string;
  accessLevel?: string;
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
    user: {
      id: "t1",
      name: "Gowher Yarashowa",
      email: "teacher@student.tm",
      role: "teacher",
      staffCode: "IUHD-T-0142",
      phone: "+993 65 214 780",
      office: "Block B, Room 305",
      officeHours: "Mon, Wed 14:00–16:00",
    },
  },
  {
    email: "admin@student.tm",
    password: "admin123",
    user: {
      id: "adm1",
      name: "Musa Yazynov",
      email: "admin@student.tm",
      role: "admin",
      staffCode: "IUHD-A-0007",
      phone: "+993 12 480 100",
      office: "Main Building, Room 101",
      accessLevel: "Full access",
    },
  },
];

export const DEMO_ACCOUNTS = DEMO.map((d) => ({ email: d.email, password: d.password, role: d.user.role }));

interface AuthCtx {
  user: SessionUser | null;
  ready: boolean;
  login: (email: string, password: string, remember: boolean) => { ok: boolean };
  register: (name: string, email: string) => void;
  logout: () => void;
  updateUser: (patch: Partial<SessionUser>) => void;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  ready: false,
  login: () => ({ ok: false }),
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
      if (raw) setUser(JSON.parse(raw) as SessionUser);
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

  const login = useCallback((email: string, password: string, remember: boolean) => {
    const found = DEMO.find(
      (d) => d.email.toLowerCase() === email.trim().toLowerCase() && d.password === password,
    );
    if (!found) return { ok: false };
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
