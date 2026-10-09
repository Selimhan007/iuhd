import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { EmptyState, PageHeader } from "@/components/app/ui-kit";
import { NotificationItem } from "@/components/app/cards";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { notifications as demoNotifications } from "@/lib/demo-data";
import { Bell, Radio } from "lucide-react";
import { getReadPostIds, markPostRead, supabase, subscribeToPosts, type UniversityPost } from "@/lib/supabase";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Student TM" },
      { name: "description", content: "Deadlines, grades, schedule changes, exams and announcements in one place." },
      { property: "og:title", content: "Notifications — Student TM" },
      { property: "og:description", content: "Deadlines, grades and schedule changes in one place." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [items, setItems] = useState(demoNotifications);
  const [livePosts, setLivePosts] = useState<UniversityPost[]>([]);
  const [readPostIds, setReadPostIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!supabase || !user) return;
      const [postsResult, reads] = await Promise.all([
        supabase.from("posts").select("id, author_id, kind, sender_scope, sender_name, title, body, course_id, group_name, due_at, published_at").order("published_at", { ascending: false }).limit(50),
        getReadPostIds(user.id),
      ]);
      if (!active) return;
      setReadPostIds(reads);
      if (postsResult.data) setLivePosts(postsResult.data as UniversityPost[]);
    };
    void load();
    const unsubscribe = subscribeToPosts((post) => {
      if (active) setLivePosts((current) => current.some((item) => item.id === post.id) ? current : [post, ...current]);
    });
    return () => { active = false; unsubscribe(); };
  }, []);

  const unreadLivePosts = useMemo(() => livePosts.filter((post) => !readPostIds.has(post.id)), [livePosts, readPostIds]);
  const unread = items.filter((n) => !n.read).length + unreadLivePosts.length;
  const visibleLivePosts = filter === "unread" ? unreadLivePosts : livePosts;
  const visibleItems = filter === "unread" ? items.filter((n) => !n.read) : items;

  const handleRead = async (postId: string) => {
    if (!user) return;
    setReadPostIds((current) => new Set(current).add(postId));
    await markPostRead(postId, user.id);
  };

  return (
    <AppShell>
      <PageHeader
        title={t("nav.notifications")}
        subtitle={`${unread} ${t("notif.unread")}`}
        action={
          unread ? (
            <button
              onClick={() => setItems((prev) => prev.map((n) => ({ ...n, read: true })))}
              className="text-sm font-semibold text-primary"
            >
              {t("notif.markAll")}
            </button>
          ) : undefined
        }
      />
      <div className="mb-4 inline-flex rounded-xl bg-muted p-1">
        {([['all', 'All'], ['unread', 'Unread']] as const).map(([value, label]) => <button key={value} onClick={() => setFilter(value)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${filter === value ? "bg-card shadow-soft" : "text-muted-foreground"}`}>{label}{value === "unread" ? ` (${unread})` : ""}</button>)}
      </div>
      {visibleLivePosts.length > 0 ? (
        <section className="mb-5 space-y-3" aria-live="polite">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Radio className="h-4 w-4" /> Live updates
          </div>
          {visibleLivePosts.map((post) => (
            <article key={post.id} className={`rounded-2xl border p-4 shadow-soft transition-colors ${readPostIds.has(post.id) ? "border-border bg-card" : "border-primary/20 bg-primary/5"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-primary">{post.sender_name} · {post.sender_scope}</p>
                  <h2 className="mt-1 font-semibold">{post.title}</h2>
                </div>
                {!readPostIds.has(post.id) ? <button type="button" onClick={() => void handleRead(post.id)} className="tap-target rounded-full bg-primary/10 px-3 py-2 text-[10px] font-bold uppercase text-primary">New</button> : null}
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{post.body}</p>
              {post.due_at ? <p className="mt-3 text-xs font-medium text-muted-foreground">Due {new Date(post.due_at).toLocaleString()}</p> : null}
            </article>
          ))}
        </section>
      ) : null}
      {visibleItems.length === 0 && visibleLivePosts.length === 0 ? (
        <EmptyState message={t("empty.notifications")} icon={<Bell className="h-6 w-6" />} />
      ) : visibleItems.length > 0 ? (
        <div className="space-y-3">
          {visibleItems.map((n) => (
            <NotificationItem
              key={n.id}
              n={n}
              onRead={() => setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
            />
          ))}
        </div>
      ) : null}
    </AppShell>
  );
}
