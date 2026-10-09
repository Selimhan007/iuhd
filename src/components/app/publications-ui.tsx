import { useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, EmptyState, ListSkeleton } from "@/components/app/ui-kit";
import { useI18n } from "@/lib/i18n";
import {
  PUB_KINDS,
  createPublication,
  deletePublication,
  usePublications,
  type PubKind,
  type SenderKind,
} from "@/lib/publications";

const inputCls =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring";

export function PublicationFeed({ kinds, title }: { kinds?: readonly string[]; title?: string }) {
  const { t } = useI18n();
  const { items, loading } = usePublications(kinds);
  if (loading) return <ListSkeleton rows={2} />;
  if (!items.length) return title ? null : <EmptyState message={t("pub.empty")} />;
  return (
    <section className="space-y-3">
      {title ? <h2 className="text-base font-semibold">{title}</h2> : null}
      {items.map((p) => (
        <Card key={p.id}>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-primary-soft px-2.5 py-0.5 font-semibold text-primary">{t(`pub.kind.${p.kind}`)}</span>
            <span className="text-muted-foreground">
              {t("pub.from")}: <span className="font-medium text-foreground">{p.sender_name}</span>
            </span>
            <span className="ml-auto text-muted-foreground">{new Date(p.created_at).toLocaleString()}</span>
          </div>
          <h3 className="mt-2 font-semibold">{p.title}</h3>
          {p.body ? <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{p.body}</p> : null}
        </Card>
      ))}
    </section>
  );
}

export function PublishPanel({
  senders,
  kinds = PUB_KINDS,
  courses,
}: {
  senders: { kind: SenderKind; name: string }[];
  kinds?: readonly PubKind[];
  courses?: { id: string; name: string }[];
}) {
  const { t } = useI18n();
  const [kind, setKind] = useState<PubKind>(kinds[0]!);
  const [sender, setSender] = useState(0);
  const [course, setCourse] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const { items } = usePublications();
  const senderNames = new Set(senders.map((s) => s.name));
  const mine = items.filter((p) => senderNames.has(p.sender_name));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    const s = senders[sender]!;
    const res = await createPublication({
      kind,
      title: title.trim(),
      body: body.trim(),
      sender_kind: s.kind,
      sender_name: s.name,
      course_id: course || null,
    });
    setBusy(false);
    if (res.ok) {
      toast.success(t("pub.sent"));
      setTitle("");
      setBody("");
    } else toast.error(t("pub.failed"));
  };

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={submit} className="space-y-3">
          <h2 className="font-semibold">{t("pub.new")}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              {t("pub.type")}
              <select className={inputCls} value={kind} onChange={(e) => setKind(e.target.value as PubKind)}>
                {kinds.map((k) => (
                  <option key={k} value={k}>{t(`pub.kind.${k}`)}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              {t("pub.sender")}
              <select className={inputCls} value={sender} onChange={(e) => setSender(Number(e.target.value))} disabled={senders.length < 2}>
                {senders.map((s, i) => (
                  <option key={s.kind} value={i}>{s.name}</option>
                ))}
              </select>
            </label>
            {courses?.length ? (
              <label className="space-y-1 text-xs font-medium text-muted-foreground sm:col-span-2">
                {t("pub.course")}
                <select className={inputCls} value={course} onChange={(e) => setCourse(e.target.value)}>
                  <option value="">{t("pub.allStudents")}</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
          <input className={inputCls} placeholder={t("pub.title")} aria-label={t("pub.title")} value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} required />
          <textarea className={`${inputCls} min-h-28`} placeholder={t("pub.body")} aria-label={t("pub.body")} value={body} maxLength={5000} onChange={(e) => setBody(e.target.value)} />
          <button disabled={busy || !title.trim()} className="tap-target flex items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            <Send className="h-4 w-4" /> {t("pub.send")}
          </button>
        </form>
      </Card>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">{t("pub.sentList")}</h2>
        {!mine.length ? <EmptyState message={t("pub.empty")} /> : null}
        {mine.map((p) => (
          <Card key={p.id} className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">{t(`pub.kind.${p.kind}`)} · {p.sender_name} · {new Date(p.created_at).toLocaleString()}</p>
              <p className="mt-1 font-semibold">{p.title}</p>
            </div>
            <button
              aria-label={t("pub.delete")}
              onClick={async () => { if ((await deletePublication(p.id)).ok) toast.success(t("pub.deleted")); }}
              className="tap-target flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </Card>
        ))}
      </section>
    </div>
  );
}
