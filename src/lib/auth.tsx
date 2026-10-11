import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role } from "./demo-data";

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

export const DEMO_ACCOUNTS: { email: string; password: string; role: Role }[] = [];

interface AuthCtx {
  user: SessionUser | null;
  ready: boolean;
  login: (id: string, password: string, remember: boolean) => Promise<{ ok: boolean }>;
  register: (name: string, id: string, password: string) => Promise<{ ok: boolean; needsConfirmation?: boolean }>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<SessionUser>) => void;
}

const Ctx = createContext<AuthCtx>({ user: null, ready: false, login: async () => ({ ok: false }), register: async () => ({ ok: false }), logout: async () => {}, updateUser: () => {} });

type AuthResponse = {
  user?: { id: string; name?: string; email?: string };
  session?: unknown;
  error?: { message?: string };
};

function authEmailFromId(id: string) {
  const normalizedId = id.trim();
  const seededEmails: Record<string, string> = {
    "1001": "student@iuhd.local",
    "1002": "teacher@iuhd.local",
    "1003": "admin@iuhd.local",
  };

  return seededEmails[normalizedId] ?? `${normalizedId}@iuhd.local`;
}

async function authRequest(path: string, body?: Record<string, unknown>): Promise<AuthResponse> {
  const response = await fetch(`/api/auth/${path}`, {
    ...(body
      ? {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }
      : { method: "GET" }),
    credentials: "include",
  });
  const payload = (await response.json().catch(() => ({}))) as AuthResponse;
  return response.ok ? payload : { error: payload.error ?? { message: "Authentication failed" } };
}

function profileUser(authUser: { id: string; name?: string; email?: string }): SessionUser {
  const email = authUser.email ?? "";
  return {
    id: authUser.id,
    email,
    name: authUser.name ?? email.split("@")[0] ?? "Student",
    role: "student" as Role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  const syncUser = useCallback(async (authUser: { id: string; name?: string; email?: string } | null) => {
    setUser(authUser ? profileUser(authUser) : null);
  }, []);

  useEffect(() => {
    let active = true;
    void authRequest("get-session").then((payload) => {
      if (active) void syncUser(payload.user ?? null);
    }).finally(() => {
      if (active) setReady(true);
    });
    return () => { active = false; };
  }, [syncUser]);

  const login = useCallback(async (id: string, password: string) => {
    if (!/^\d+$/.test(id.trim())) return { ok: false };
    const payload = await authRequest("sign-in/email", { email: authEmailFromId(id), password });
    return { ok: Boolean(payload.user) };
  }, []);

  const register = useCallback(async (name: string, id: string, password: string) => {
    if (!/^\d+$/.test(id.trim())) return { ok: false, needsConfirmation: false };
    const payload = await authRequest("sign-up/email", { name: name.trim() || `Student ${id.trim()}`, email: authEmailFromId(id), password });
    return { ok: Boolean(payload.user), needsConfirmation: false };
  }, []);

  const logout = useCallback(async () => { await authRequest("sign-out", {}); setUser(null); }, []);
  const updateUser = useCallback((patch: Partial<SessionUser>) => setUser((current) => current ? { ...current, ...patch } : current), []);

  return <Ctx.Provider value={{ user, ready, login, register, logout, updateUser }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
