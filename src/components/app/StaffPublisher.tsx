import { useState, type FormEvent } from "react";
import { Send, Paperclip } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { publishPost, uploadMaterial, type ContentKind, type SenderScope } from "@/lib/supabase";

const kinds: { value: ContentKind; label: string }[] = [
  { value: "bildirishler", label: "Bildirişler" },
  { value: "chare", label: "Çäre" },
  { value: "habarnamalar", label: "Habarnamalar" },
  { value: "synaglar", label: "Synaglar" },
  { value: "yumuslar", label: "Ýumuşlar" },
  { value: "bahalaw", label: "Bahalaş" },
  { value: "material", label: "Material" },
];

export function StaffPublisher() {
  const { user } = useAuth();
  const [kind, setKind] = useState<ContentKind>(user?.role === "teacher" ? "material" : "bildirishler");
  const [scope, setScope] = useState<SenderScope>(user?.role === "teacher" ? "teacher" : "university");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !title.trim() || !body.trim()) return;
    setStatus(null);
    const { data: post, error } = await publishPost({ author_id: user.id, kind, sender_scope: scope, sender_name: user.name, title: title.trim(), body: body.trim(), course_id: null, group_name: null, due_at: dueAt || null });
    if (error || !post) { setStatus("Не удалось опубликовать. Проверьте подключение и права пользователя."); return; }
    if (file) {
      const uploaded = await uploadMaterial(file, post.id);
      if (uploaded.error) { setStatus("Запись опубликована, но файл загрузить не удалось."); return; }
    }
    setTitle(""); setBody(""); setDueAt(""); setFile(null); setStatus("Опубликовано. Студенты увидят запись в реальном времени.");
  }

  return <form onSubmit={submit} className="card-surface space-y-4 p-5">
    <div><h2 className="font-bold">Публикация для студентов</h2><p className="mt-1 text-sm text-muted-foreground">Новые записи появятся у студентов без перезагрузки.</p></div>
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-medium">Тип<select value={kind} onChange={(e) => setKind(e.target.value as ContentKind)} className="mt-1 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-base">{kinds.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
      <label className="text-sm font-medium">От имени<select value={scope} onChange={(e) => setScope(e.target.value as SenderScope)} disabled={user?.role === "teacher"} className="mt-1 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-base"><option value="university">Университет</option><option value="department">Кафедра</option><option value="dean">Декан</option><option value="teacher">Преподаватель</option></select></label>
    </div>
    <label className="block text-sm font-medium">Заголовок<input value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-base" /></label>
    <label className="block text-sm font-medium">Текст<textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={4} className="mt-1 w-full resize-none rounded-xl border border-border bg-background px-3 py-3 text-base" /></label>
    <label className="block text-sm font-medium">Срок (необязательно)<input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-border bg-background px-3 text-base" /></label>
    <label className="block text-sm font-medium">Файл или материал (необязательно)<span className="mt-1 flex min-h-11 items-center gap-2 rounded-xl border border-dashed border-border bg-background px-3 text-sm text-muted-foreground"><Paperclip className="h-4 w-4 shrink-0" /><input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="min-w-0 flex-1 text-sm" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,image/*" /> </span></label>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><span className="text-xs text-muted-foreground">Публикация доступна всем студентам.</span><button type="submit" className="tap-target inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><Send className="h-4 w-4" />Опубликовать</button></div>
    {status ? <p role="status" className="text-sm text-muted-foreground">{status}</p> : null}
  </form>;
}
