import { useMemo, useState } from "react";
import { Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { Card, EmptyState } from "@/components/app/ui-kit";
import { useI18n } from "@/lib/i18n";

export interface ResourceItem {
  id: string;
  label: string;
  sub: string;
}

const inputCls =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring";

export function ResourceManager({
  title,
  items,
  onChange,
}: {
  title: string;
  items: ResourceItem[];
  onChange: (next: ResourceItem[]) => void;
}) {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ label: "", sub: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState({ label: "", sub: "" });
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((i) => i.label.toLowerCase().includes(query) || i.sub.toLowerCase().includes(query));
  }, [items, q]);

  const add = () => {
    if (!draft.label.trim()) return;
    onChange([{ id: `new-${Date.now()}`, label: draft.label.trim(), sub: draft.sub.trim() || "—" }, ...items]);
    setDraft({ label: "", sub: "" });
    setAdding(false);
  };

  const saveEdit = () => {
    if (!editingId || !edit.label.trim()) return;
    onChange(items.map((i) => (i.id === editingId ? { ...i, label: edit.label.trim(), sub: edit.sub.trim() || "—" } : i)));
    setEditingId(null);
  };

  return (
    <Card className="p-0">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">
            {items.length} {t("admin.records")}
          </p>
        </div>
        <div className="relative sm:w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("admin.search")}
            aria-label={t("admin.search")}
            className={`${inputCls} pl-9`}
          />
        </div>
        <button
          onClick={() => setAdding((v) => !v)}
          className="tap-target flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> {t("admin.add")}
        </button>
      </div>

      {adding ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
          className="grid gap-3 border-b border-border bg-primary-soft/40 p-4 sm:grid-cols-[1fr_1fr_auto]"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-primary sm:col-span-3">
            {t("admin.newRecord")}
          </p>
          <input
            autoFocus
            value={draft.label}
            onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
            placeholder={t("admin.name")}
            aria-label={t("admin.name")}
            className={inputCls}
          />
          <input
            value={draft.sub}
            onChange={(e) => setDraft((d) => ({ ...d, sub: e.target.value }))}
            placeholder={t("admin.details")}
            aria-label={t("admin.details")}
            className={inputCls}
          />
          <div className="flex gap-2">
            <button type="submit" className="tap-target rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
              {t("admin.save")}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="tap-target rounded-xl bg-muted px-4 text-sm font-semibold text-muted-foreground"
            >
              {t("admin.cancel")}
            </button>
          </div>
        </form>
      ) : null}

      {filtered.length === 0 ? (
        <div className="p-4">
          <EmptyState message={t("admin.noResults")} />
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {filtered.map((item, idx) => (
            <li key={item.id} className="flex items-center gap-3 px-4 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                {idx + 1}
              </span>
              {editingId === item.id ? (
                <form
                  className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row"
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveEdit();
                  }}
                >
                  <input
                    autoFocus
                    value={edit.label}
                    onChange={(e) => setEdit((d) => ({ ...d, label: e.target.value }))}
                    aria-label={t("admin.name")}
                    className={inputCls}
                  />
                  <input
                    value={edit.sub}
                    onChange={(e) => setEdit((d) => ({ ...d, sub: e.target.value }))}
                    aria-label={t("admin.details")}
                    className={inputCls}
                  />
                  <div className="flex gap-1">
                    <button
                      type="submit"
                      aria-label={t("admin.save")}
                      className="tap-target flex items-center justify-center rounded-xl bg-primary text-primary-foreground"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={t("admin.cancel")}
                      onClick={() => setEditingId(null)}
                      className="tap-target flex items-center justify-center rounded-xl bg-muted text-muted-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                  {confirmId === item.id ? (
                    <div className="flex items-center gap-2">
                      <span className="hidden text-xs text-muted-foreground sm:inline">{t("admin.confirmDelete")}</span>
                      <button
                        onClick={() => {
                          onChange(items.filter((x) => x.id !== item.id));
                          setConfirmId(null);
                        }}
                        className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground"
                      >
                        {t("admin.delete")}
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground"
                      >
                        {t("admin.cancel")}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        aria-label={`${t("admin.edit")}: ${item.label}`}
                        onClick={() => {
                          setEditingId(item.id);
                          setEdit({ label: item.label, sub: item.sub });
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        aria-label={`${t("admin.delete")}: ${item.label}`}
                        onClick={() => setConfirmId(item.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
