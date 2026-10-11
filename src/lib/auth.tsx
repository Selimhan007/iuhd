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
  login: (email: string, password: string, remember: boolean) => Promise<{ ok: boolean }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; needsConfirmation?: boolean }>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<SessionUser>) => void;
}

const Ctx = createContext<AuthCtx>({ user: null, ready: false, login: async () => ({ ok: false }), register: async () => ({ ok: false }), logout: async () => {}, updateUser: () => {} });

type AuthResponse = {
  user?: { id: string; name?: string; email?: string };
  session?: unknown;
  error?: { message?: string };
};

async function authRequest(path: string, body?: Record<string, unknown>): Promise<AuthResponse> {
  const response = await fetch(`/api/auth/${path}`, {
    method: body ? "POST" : "GET",
    headers: body ? { "content-type": "application/json" } : undefined,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
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

  const login = useCallback(async (email: string, password: string) => {
    const payload = await authRequest("sign-in/email", { email: email.trim(), password });
    return { ok: Boolean(payload.user) };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const payload = await authRequest("sign-up/email", { name: name.trim() || email.split("@")[0], email: email.trim(), password });
    return { ok: Boolean(payload.user), needsConfirmation: false };
  }, []);

  const logout = useCallback(async () => { await authRequest("sign-out", {}); setUser(null); }, []);
  const updateUser = useCallback((patch: Partial<SessionUser>) => setUser((current) => current ? { ...current, ...patch } : current), []);

  return <Ctx.Provider value={{ user, ready, login, register, logout, updateUser }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
