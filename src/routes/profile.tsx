import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Card, PageHeader } from "@/components/app/ui-kit";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { currentStudent, department, faculty, group, program, university } from "@/lib/demo-data";
import { BriefcaseBusiness, GraduationCap, Settings, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Student TM" },
      {
        name: "description",
        content: "Student profile with university, faculty, program, group and contact details.",
      },
      { property: "og:title", content: "Profile — Student TM" },
      { property: "og:description", content: "Student profile and academic details." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { t } = useI18n();
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? currentStudent.phone);

  const initials = (user?.name ?? "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  const role = user?.role ?? "student";
  const roleLabel = t(`role.${role === "superadmin" ? "admin" : role}`);
  const profileDetails: [string, string][] =
    role === "student"
      ? [
          [t("profile.studentId"), user?.studentCode ?? currentStudent.studentCode],
          [t("profile.university"), university.name],
          [t("profile.faculty"), faculty.name],
          [t("profile.department"), department.name],
          [t("profile.specialization"), program.name],
          [t("profile.year"), String(group.year)],
          [t("profile.group"), group.name],
        ]
      : role === "teacher"
        ? [
            ["Staff ID", user?.staffCode ?? "T-0001"],
            [t("profile.university"), university.name],
            [t("profile.department"), department.name],
            ["Position", user?.accessLevel ?? "Lecturer"],
            ["Office", user?.office ?? "Faculty building, room 204"],
            ["Office hours", user?.officeHours ?? "Mon–Wed, 14:00–16:00"],
          ]
        : [
            ["Admin ID", user?.staffCode ?? "ADM-0001"],
            [t("profile.university"), university.name],
            [t("profile.faculty"), faculty.name],
            [
              "Access level",
              user?.accessLevel ??
                (role === "superadmin" ? "Super administrator" : "Administrator"),
            ],
            ["Managed groups", group.name],
          ];
  const rows: [string, string][] = [
    ...profileDetails,
    [t("profile.email"), email],
    [t("profile.phone"), phone],
  ];

  const field =
    "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring";

  return (
    <AppShell>
      <PageHeader
        title={t("nav.profile")}
        action={
          <Link
            to="/settings"
            aria-label={t("nav.settings")}
            className="tap-target flex items-center text-muted-foreground"
          >
            <Settings className="h-5 w-5" />
          </Link>
        }
      />

      <Card className="mb-5 flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold">{user?.name}</p>
          <p className="text-sm text-muted-foreground">
            {role === "student" ? `${program.name} · ${group.name}` : university.shortName}
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
            {role === "student" ? (
              <GraduationCap className="h-3.5 w-3.5" />
            ) : role === "teacher" ? (
              <BriefcaseBusiness className="h-3.5 w-3.5" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5" />
            )}
            {roleLabel}
          </p>
        </div>
      </Card>

      {editing ? (
        <Card className="space-y-3">
          <input
            className={field}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("auth.fullName")}
          />
          <input
            className={field}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("profile.email")}
          />
          <input
            className={field}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("profile.phone")}
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                updateUser({ name, email, phone });
                setEditing(false);
                setSaved(true);
              }}
              className="tap-target flex-1 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              {t("profile.save")}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="tap-target rounded-xl border border-border px-4 text-sm font-medium"
            >
              {t("profile.cancel")}
            </button>
          </div>
        </Card>
      ) : (
        <>
          {saved ? (
            <p className="mb-3 text-sm font-semibold text-success">{t("profile.saved")}</p>
          ) : null}
          <Card className="space-y-3">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-6 text-sm">
                <span className="shrink-0 text-muted-foreground">{label}</span>
                <span className="text-right font-medium">{value}</span>
              </div>
            ))}
          </Card>
          <button
            onClick={() => setEditing(true)}
            className="tap-target mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
          >
            {t("profile.edit")}
          </button>
        </>
      )}
    </AppShell>
  );
}
