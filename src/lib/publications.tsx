import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const PUB_KINDS = [
  "announcement",
  "notice",
  "notification",
  "exam",
  "assignment",
  "grade",
  "material",
  "lecture",
  "event",
] as const;
export type PubKind = (typeof PUB_KINDS)[number];
export type SenderKind = "university" | "department" | "dean" | "teacher";

export interface Publication {
  id: string;
  kind: string;
  title: string;
  body: string;
  sender_kind: string;
  sender_name: string;
  course_id: string | null;
  author_id: string;
  created_at: string;
}

/** Live list of publications; updates instantly via realtime. */
export function usePublications(kinds?: readonly string[]) {
  const [items, setItems] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const key = kinds?.join(",") ?? "";

  useEffect(() => {
    let alive = true;
    const load = async () => {
      let q = supabase.from("publications").select("*").order("created_at", { ascending: false }).limit(100);
      if (kinds?.length) q = q.in("kind", [...kinds]);
      const { data, error: err } = await q;
      if (!alive) return;
      setError(!!err);
      setItems((data as Publication[] | null) ?? []);
      setLoading(false);
    };
    void load();
    const ch = supabase
      .channel(`pubs-${key}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "publications" }, () => void load())
      .subscribe();
    return () => {
      alive = false;
      void supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { items, loading, error };
}

export async function createPublication(p: {
  kind: PubKind;
  title: string;
  body: string;
  sender_kind: SenderKind;
  sender_name: string;
  course_id?: string | null;
}) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { ok: false };
  const { error } = await supabase.from("publications").insert({ ...p, course_id: p.course_id ?? null, author_id: data.user.id });
  return { ok: !error };
}

export async function deletePublication(id: string) {
  const { error } = await supabase.from("publications").delete().eq("id", id);
  return { ok: !error };
}

/** Admin-managed lists persisted in the backend; falls back to demo items. */
export function useAdminList<T>(resource: string, fallback: T[]) {
  const [items, setItems] = useState<T[]>(fallback);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      const { data } = await supabase.from("admin_lists").select("items").eq("resource", resource).maybeSingle();
      if (alive && data?.items && Array.isArray(data.items)) setItems(data.items as T[]);
    };
    void load();
    const ch = supabase
      .channel(`list-${resource}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_lists" }, () => void load())
      .subscribe();
    return () => {
      alive = false;
      void supabase.removeChannel(ch);
    };
  }, [resource]);
  const save = async (next: T[]) => {
    setItems(next);
    await supabase.from("admin_lists").upsert({ resource, items: next as never, updated_at: new Date().toISOString() });
  };
  return [items, save] as const;
}
