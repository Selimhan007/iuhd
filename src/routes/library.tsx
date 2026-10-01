import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/ui-kit";
import { BookOpen, Bookmark, Check, Clock3, Download, Filter, LibraryBig, Search, Star } from "lucide-react";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "University library — Student TM" },
      { name: "description", content: "Discover books, journals and digital resources from your university library." },
    ],
  }),
  component: LibraryPage,
});

type Resource = { id: number; title: string; author: string; type: string; category: string; year: string; available: boolean; rating: string; color: string };

const resources: Resource[] = [
  { id: 1, title: "Introduction to Algorithms", author: "T. Cormen, C. Leiserson", type: "Книга", category: "IT и технологии", year: "2024", available: true, rating: "4.9", color: "from-blue-500 to-cyan-400" },
  { id: 2, title: "Academic Writing Guide", author: "University Press", type: "Пособие", category: "Языки", year: "2023", available: true, rating: "4.7", color: "from-violet-500 to-fuchsia-400" },
  { id: 3, title: "Modern Microeconomics", author: "A. Mas-Colell", type: "Книга", category: "Экономика", year: "2022", available: false, rating: "4.8", color: "from-amber-500 to-orange-400" },
  { id: 4, title: "Data Structures & Patterns", author: "R. Sedgewick", type: "Электронная книга", category: "IT и технологии", year: "2024", available: true, rating: "4.9", color: "from-emerald-500 to-teal-400" },
];

function LibraryPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Все");
  const [saved, setSaved] = useState<number[]>([2]);
  const categories = ["Все", "IT и технологии", "Языки", "Экономика"];
  const filtered = useMemo(() => resources.filter((item) => {
    const matchesQuery = `${item.title} ${item.author}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (category === "Все" || item.category === category);
  }), [query, category]);

  const toggleSaved = (id: number) => setSaved((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);

  return (
    <AppShell allow={["student", "teacher"]}>
      <div className="space-y-5">
        <PageHeader title="Библиотека" description="Знания всегда рядом" />

        <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-primary via-primary to-indigo-500 p-5 text-primary-foreground shadow-lg shadow-primary/20">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">Университетская коллекция</p>
              <h2 className="mt-2 max-w-[220px] text-2xl font-extrabold leading-tight">Найди свою следующую идею</h2>
              <p className="mt-2 text-sm text-primary-foreground/75">12 480 книг и материалов для учёбы</p>
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm"><LibraryBig className="h-7 w-7" /></div>
          </div>
          <div className="relative mt-5 flex items-center gap-2 rounded-2xl bg-white p-1.5 text-foreground shadow-xl">
            <Search className="ml-2 h-4 w-4 text-muted-foreground" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск книг, авторов..." className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-muted-foreground" aria-label="Поиск в библиотеке" />
          </div>
        </section>

        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${category === item ? "bg-foreground text-background" : "border border-border bg-card text-muted-foreground"}`}>{item}</button>)}
          <button className="ml-auto flex shrink-0 items-center gap-1 rounded-full border border-border px-3 py-2 text-xs font-semibold text-muted-foreground"><Filter className="h-3.5 w-3.5" /> Фильтр</button>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Популярное сейчас</h2><span className="text-xs text-muted-foreground">{filtered.length} результата</span></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((item) => <article key={item.id} className="group rounded-2xl border border-border bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className={`relative flex h-28 items-end overflow-hidden rounded-xl bg-gradient-to-br ${item.color} p-3 text-white`}>
                <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/15 backdrop-blur-sm"><BookOpen className="h-4 w-4" /></div>
                <span className="relative max-w-[80%] text-sm font-bold leading-tight">{item.title}</span>
              </div>
              <div className="pt-3"><div className="flex items-start justify-between gap-2"><div><h3 className="text-sm font-bold leading-tight">{item.title}</h3><p className="mt-1 text-xs text-muted-foreground">{item.author}</p></div><button onClick={() => toggleSaved(item.id)} aria-label={saved.includes(item.id) ? "Удалить из сохранённых" : "Сохранить книгу"} className={`rounded-lg p-1.5 ${saved.includes(item.id) ? "text-primary" : "text-muted-foreground"}`}><Bookmark className={`h-4 w-4 ${saved.includes(item.id) ? "fill-current" : ""}`} /></button></div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground"><span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {item.rating}</span><span>{item.type} · {item.year}</span></div>
                <button className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition ${item.available ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground"}`} disabled={!item.available}>{item.available ? <><Download className="h-3.5 w-3.5" /> Читать онлайн</> : <><Clock3 className="h-3.5 w-3.5" /> На руках</>}</button>
              </div>
            </article>)}
          </div>
          {filtered.length === 0 && <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Ничего не найдено. Попробуйте изменить запрос.</div>}
        </section>

        <section className="rounded-2xl border border-border bg-card p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600"><Check className="h-5 w-5" /></div><div><h2 className="text-sm font-bold">Мои книги</h2><p className="text-xs text-muted-foreground">{saved.length} сохранено · доступно в любой момент</p></div><Bookmark className="ml-auto h-4 w-4 text-muted-foreground" /></div></section>
      </div>
    </AppShell>
  );
}

export default LibraryPage;
