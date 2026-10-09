import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = url && key ? createClient(url, key) : null;

export type ContentKind = "bildirishler" | "chare" | "habarnamalar" | "synaglar" | "yumuslar" | "bahalaw" | "material";
export type SenderScope = "university" | "department" | "dean" | "teacher";

export type UniversityPost = {
  id: string;
  author_id: string;
  kind: ContentKind;
  sender_scope: SenderScope;
  sender_name: string;
  title: string;
  body: string;
  course_id: string | null;
  group_name: string | null;
  due_at: string | null;
  published_at: string;
};

export async function publishPost(input: Omit<UniversityPost, "id" | "published_at">) {
  if (!supabase) return { data: null, error: new Error("Supabase is not configured") };
  return supabase.from("posts").insert(input).select().single();
}

export async function markPostRead(postId: string, userId: string) {
  if (!supabase) return;
  await supabase.from("post_reads").upsert({ post_id: postId, user_id: userId });
}

export function subscribeToPosts(onChange: (post: UniversityPost) => void) {
  if (!supabase) return () => undefined;
  const channel = supabase.channel("university-posts").on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "posts" },
    (payload) => onChange(payload.new as UniversityPost),
  ).subscribe();
  return () => { void supabase.removeChannel(channel); };
}
