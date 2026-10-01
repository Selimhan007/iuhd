import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox, AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function SectionTitle({ title, to, label }: { title: string; to?: string; label?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      {to ? (
        <Link to={to} className="text-sm font-medium text-primary hover:underline">
          {label}
        </Link>
      ) : null}
    </div>
  );
}

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("card-surface p-4", className)} {...rest}>
      {children}
    </div>
  );
}

const toneMap: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-primary-soft text-primary",
  success: "bg-success/12 text-success",
  warning: "bg-warning/18 text-warning-foreground dark:text-warning",
  danger: "bg-destructive/12 text-destructive",
};

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof toneMap | string | undefined;
  className?: string | undefined;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        toneMap[tone] ?? toneMap["neutral"],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({ message, icon }: { message: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
      <AlertTriangle className="mb-3 h-6 w-6 text-destructive" />
      <p className="text-sm font-medium">{t("error.generic")}</p>
      {onRetry ? (
        <button onClick={onRetry} className="mt-3 text-sm font-semibold text-primary hover:underline">
          {t("auth.back")}
        </button>
      ) : null}
    </div>
  );
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export function ProgressBar({ value, color }: { value: number; color?: string | undefined }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all duration-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, ...(color ? { backgroundColor: color } : {}) }}
      />
    </div>
  );
}
