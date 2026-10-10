import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role } from "./demo-data";
import { supabase } from "./supabase";

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

async function profileUser(id: string, email: string): Promise<SessionUser> {
  const { data } = await supabase!.from("profiles").select("id, full_name, role, department, group_name").eq("id", id).maybeSingle();
  return { id, email, name: data?.full_name ?? email.split("@")[0] ?? "Student", role: (data?.role ?? "student") as Role, office: data?.department ?? undefined, studentCode: data?.group_name ?? undefined };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  const syncUser = useCallback(async (authUser: { id: string; email?: string } | null) => {
    if (!authUser || !supabase) { setUser(null); return; }
    setUser(await profileUser(authUser.id, authUser.email ?? ""));
  }, []);

  useEffect(() => {
    if (!supabase) { setReady(true); return; }
    let active = true;
    void supabase.auth.getUser().then(({ data }) => { if (active) void syncUser(data.user); }).finally(() => { if (active) setReady(true); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { void syncUser(session?.user ?? null); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [syncUser]);

  const login = useCallback(async (email: string, password: string) => {
    if (!supabase) return { ok: false };
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return { ok: !error };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    if (!supabase) return { ok: false };
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() || email.split("@")[0] } } });
    return { ok: !error, needsConfirmation: !data.session };
  }, []);

  const logout = useCallback(async () => { if (supabase) await supabase.auth.signOut(); setUser(null); }, []);
  const updateUser = useCallback((patch: Partial<SessionUser>) => setUser((current) => current ? { ...current, ...patch } : current), []);

  return <Ctx.Provider value={{ user, ready, login, register, logout, updateUser }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
