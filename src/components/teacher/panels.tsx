import { useMemo, useState, type FormEvent } from "react";
import { Check, Clock, FileText, FileUp, Filter, MapPin, Search, Trash2, Users } from "lucide-react";
import { Card, EmptyState, Pill, ProgressBar } from "@/components/app/ui-kit";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { group, students, type Assignment, type Course, type Lesson } from "@/lib/demo-data";

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const studentAttendance = (index: number) => 78 + ((index * 7) % 21);

export function TodayClasses({
  lessons,
  courseById,
  onMark,
}: {
  lessons: Lesson[];
  courseById: (id: string) => Course | undefined;
  onMark: (courseId: string) => void;
}) {
  const { t } = useI18n();
  if (lessons.length === 0) return <EmptyState message={t("teacher.noClassesToday")} />;
  return (
    <ol className="space-y-3">
      {lessons.map((l) => {
        const c = courseById(l.courseId);
        return (
          <li key={l.id}>
            <Card className={cn("flex items-center gap-4", l.cancelled && "opacity-60")}>
              <div className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-primary-soft py-2 text-primary">
                <span className="text-sm font-bold">{l.start}</span>
                <span className="text-[11px] opacity-80">{l.end}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{c?.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {t("schedule.room")} {l.room}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {group.name}
                  </span>
                  <span className="capitalize">{l.type}</span>
                </div>
              </div>
              {l.cancelled ? (
                <Pill tone="danger">{t("status.cancelled")}</Pill>
              ) : (
                <button
                  onClick={() => onMark(l.courseId)}
                  className="tap-target shrink-0 rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {t("teacher.markAttendance")}
                </button>
              )}
            </Card>
          </li>
        );
      })}
    </ol>
  );
}

export function CourseGrid({ courses, lessonsPerCourse }: { courses: Course[]; lessonsPerCourse: (id: string) => number }) {
  const { t } = useI18n();
  if (courses.length === 0) return <EmptyState message={t("empty.generic")} />;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {courses.map((c) => (
        <Card key={c.id} className="overflow-hidden p-0">
          <div className="h-1.5 w-full" style={{ backgroundColor: c.color }} />
          <div className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-muted-foreground">{c.code}</p>
                <p className="truncate font-semibold">{c.name}</p>
              </div>
              <Pill tone="primary">
                {c.credits} {t("courses.credits")}
              </Pill>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> {students.length}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {lessonsPerCourse(c.id)} {t("teacher.lessonsWeek").toLowerCase()}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{t("courses.progress")}</span>
                <span className="font-semibold">{c.progress}%</span>
              </div>
              <ProgressBar value={c.progress} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

type Mark = "present" | "late" | "absent";

export function AttendancePanel({
  courses,
  courseId,
  onCourseChange,
}: {
  courses: Course[];
  courseId: string;
  onCourseChange: (id: string) => void;
}) {
  const { t } = useI18n();
  const [marks, setMarks] = useState<Record<string, Record<string, Mark>>>({});
  const [savedFor, setSavedFor] = useState<string | null>(null);

  const current = marks[courseId] ?? {};
  const markOf = (sid: string): Mark => current[sid] ?? "present";
  const counts = students.reduce(
    (acc, s) => {
      acc[markOf(s.id)]++;
      return acc;
    },
    { present: 0, late: 0, absent: 0 } as Record<Mark, number>,
  );

  const setMark = (sid: string, m: Mark) => {
    setSavedFor(null);
    setMarks((prev) => ({ ...prev, [courseId]: { ...(prev[courseId] ?? {}), [sid]: m } }));
  };

  const options: { value: Mark; label: string; active: string }[] = [
    { value: "present", label: t("teacher.present"), active: "bg-success text-success-foreground" },
    { value: "late", label: t("teacher.late"), active: "bg-warning text-warning-foreground" },
    { value: "absent", label: t("teacher.absent"), active: "bg-destructive text-destructive-foreground" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">{t("teacher.course")}</span>
          <select
            value={courseId}
            onChange={(e) => {
              setSavedFor(null);
              onCourseChange(e.target.value);
            }}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm font-medium outline-none focus:border-ring"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2">
          <Pill tone="success">
            {t("teacher.present")}: {counts.present}
          </Pill>
          <Pill tone="warning">
            {t("teacher.late")}: {counts.late}
          </Pill>
          <Pill tone="danger">
            {t("teacher.absent")}: {counts.absent}
          </Pill>
        </div>
      </div>

      <Card className="divide-y divide-border p-0">
        {students.map((s) => (
          <div key={s.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                {initials(s.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.studentCode}</p>
              </div>
            </div>
            <div role="radiogroup" aria-label={s.name} className="flex gap-1 rounded-xl bg-muted p-1">
              {options.map((o) => {
                const active = markOf(s.id) === o.value;
                return (
                  <button
                    key={o.value}
                    role="radio"
                    aria-checked={active}
                    onClick={() => setMark(s.id, o.value)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                      active ? o.active : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </Card>

      <div className="flex justify-end">
        <button
          onClick={() => setSavedFor(courseId)}
          className="tap-target flex items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {savedFor === courseId ? <Check className="h-4 w-4" /> : null}
          {savedFor === courseId ? t("teacher.saved") : t("teacher.save")}
        </button>
      </div>
    </div>
  );
}

export interface Submission {
  id: string;
  assignment: Assignment;
  studentName: string;
  score?: number | undefined;
}

export function SubmissionsPanel({
  submissions,
  courseName,
}: {
  submissions: Submission[];
  courseName: (id: string) => string;
}) {
  const { t } = useI18n();
  const [scores, setScores] = useState<Record<string, number>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  if (submissions.length === 0) return <EmptyState message={t("empty.generic")} />;

  return (
    <div className="space-y-3">
      {submissions.map((sub) => {
        const score = scores[sub.id] ?? sub.score;
        return (
          <Card key={sub.id} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                {initials(sub.studentName)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{sub.assignment.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {sub.studentName} · {courseName(sub.assignment.courseId)}
                </p>
              </div>
            </div>
            {score !== undefined ? (
              <Pill tone="success">{score}/100</Pill>
            ) : (
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const n = Number(drafts[sub.id]);
                  if (!Number.isFinite(n) || n < 0 || n > 100) return;
                  setScores((s) => ({ ...s, [sub.id]: Math.round(n) }));
                }}
              >
                <label className="sr-only" htmlFor={`score-${sub.id}`}>
                  {t("teacher.score")}
                </label>
                <input
                  id={`score-${sub.id}`}
                  type="number"
                  min={0}
                  max={100}
                  inputMode="numeric"
                  placeholder="0–100"
                  value={drafts[sub.id] ?? ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [sub.id]: e.target.value }))}
                  className="w-20 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                />
                <button
                  type="submit"
                  className="tap-target rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground"
                >
                  {t("teacher.gradeIt")}
                </button>
              </form>
            )}
          </Card>
        );
      })}
    </div>
  );
}

type LectureMaterial = {
  id: string;
  title: string;
  fileName: string;
  courseId: string;
  groupId: string;
  groupName: string;
  uploadedAt: string;
};

const TEACHER_GROUPS = [group, { id: "g2", programId: "p1", name: "1C", year: 1 }, { id: "g3", programId: "p1", name: "2A", year: 2 }];

export function LectureMaterialsPanel({ courses }: { courses: Course[] }) {
  const [materials, setMaterials] = useState<LectureMaterial[]>([]);
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [groupId, setGroupId] = useState(group.id);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [published, setPublished] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [query, setQuery] = useState("");
  const [filterGroup, setFilterGroup] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "title">("newest");

  const visibleMaterials = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return materials
      .filter((material) => filterGroup === "all" || material.groupId === filterGroup)
      .filter((material) => !normalized || `${material.title} ${material.fileName}`.toLowerCase().includes(normalized))
      .sort((a, b) => sortBy === "title" ? a.title.localeCompare(b.title) : b.id.localeCompare(a.id));
  }, [filterGroup, materials, query, sortBy]);

  const addMaterial = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPublished(null);
    if (!title.trim() || !file || !courseId) {
      setError("Enter a title and choose a lecture file.");
      return;
    }
    const allowed = /\.(pdf|doc|docx|ppt|pptx|mp4)$/i;
    const allowedTypes = new Set(["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "video/mp4"]);
    if (!allowed.test(file.name) || (file.type && !allowedTypes.has(file.type))) {
      setError("Use PDF, DOC, DOCX, PPT, PPTX or MP4 files only.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("The maximum lecture size is 10 MB.");
      return;
    }
    setIsPublishing(true);
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    const selectedGroup = TEACHER_GROUPS.find((item) => item.id === groupId);
    setMaterials((current) => [
      {
        id: `lecture-${Date.now()}`,
        title: title.trim(),
        fileName: file.name,
        courseId,
        groupId,
        groupName: selectedGroup?.name ?? group.name,
        uploadedAt: new Date().toLocaleDateString(),
      },
      ...current,
    ]);
    setTitle("");
    setFile(null);
    setIsPublishing(false);
    setPublished(`Lecture published for ${selectedGroup?.name ?? group.name}`);
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-primary-soft/30">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <FileUp className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-semibold">Upload lecture</h3>
            <p className="text-xs text-muted-foreground">Publish a file directly to a selected group.</p>
          </div>
        </div>
        <form onSubmit={addMaterial} className="grid gap-3">
          <label className="grid gap-1.5 text-sm font-medium">
            Lecture title
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Week 4 — Motion" className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring" required />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Course
            <select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring">
              {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Student group
            <select value={groupId} onChange={(event) => setGroupId(event.target.value)} className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring">
              {TEACHER_GROUPS.map((studentGroup) => (
                <option key={studentGroup.id} value={studentGroup.id}>{studentGroup.name} · Year {studentGroup.year}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Lecture file
            <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4" onChange={(event) => { setError(null); setFile(event.target.files?.[0] ?? null); }} className="block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary-soft file:px-2 file:py-1 file:text-xs file:font-semibold file:text-primary" required />
            <span className="text-xs font-normal text-muted-foreground">PDF, DOC, DOCX, PPT, PPTX or MP4 · max 10 MB</span>
          </label>
          <button type="submit" disabled={isPublishing} className="tap-target flex items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
            <FileUp className="h-4 w-4" /> {isPublishing ? "Publishing…" : "Publish lecture"}
          </button>
          {error ? <p role="alert" className="text-center text-xs font-medium text-destructive">{error}</p> : null}
          {published ? <p role="status" className="text-center text-xs font-medium text-success">{published}</p> : null}
        </form>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="font-semibold">Published lectures</h3>
          <p className="text-xs text-muted-foreground">Visible only to the selected student group.</p>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{visibleMaterials.length}/{materials.length}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <label className="relative">
          <span className="sr-only">Search lectures</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search lectures" className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-ring" />
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-input bg-background px-3 text-sm">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Filter by group</span>
          <select value={filterGroup} onChange={(event) => setFilterGroup(event.target.value)} className="bg-transparent py-2.5 outline-none">
            <option value="all">All groups</option>
            {TEACHER_GROUPS.map((studentGroup) => <option key={studentGroup.id} value={studentGroup.id}>{studentGroup.name}</option>)}
          </select>
        </label>
        <select aria-label="Sort lectures" value={sortBy} onChange={(event) => setSortBy(event.target.value as "newest" | "title")} className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring">
          <option value="newest">Newest first</option>
          <option value="title">Title A–Z</option>
        </select>
      </div>
      {visibleMaterials.length === 0 ? (
        <EmptyState message={materials.length === 0 ? "No lectures uploaded yet." : "No lectures match your filters."} />
      ) : (
        <div className="space-y-3">
          {visibleMaterials.map((material) => (
            <Card key={material.id} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"><FileText className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{material.title}</p>
                <p className="truncate text-xs text-muted-foreground">{material.fileName} · {material.uploadedAt}</p>
                <p className="mt-1 text-xs font-medium text-primary">{material.groupName}</p>
              </div>
              <button aria-label={`Delete ${material.title}`} onClick={() => { if (window.confirm(`Delete “${material.title}” for group ${material.groupName}?`)) setMaterials((current) => current.filter((item) => item.id !== material.id)); }} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function TeacherInsightsPanel({ pending, avgAttendance }: { pending: number; avgAttendance: number }) {
  const { t } = useI18n();
  const [groupFilter, setGroupFilter] = useState("all");
  const [exported, setExported] = useState(false);
  const metrics = [
    { label: t("teacher.averageGroupGrade"), value: "86%", detail: t("teacher.thisMonth"), tone: "text-success" },
    { label: t("teacher.attendance"), value: `${avgAttendance}%`, detail: t("teacher.acrossGroups"), tone: "text-primary" },
    { label: t("teacher.overdueWork"), value: pending, detail: t("teacher.needsReview"), tone: "text-warning" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h3 className="font-semibold">{t("teacher.groupAnalytics")}</h3><p className="text-xs text-muted-foreground">{t("teacher.trackProgress")}</p></div>
        <div className="flex gap-2">
          <select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)} aria-label={t("teacher.allGroups")} className="rounded-xl border border-input bg-background px-3 py-2 text-sm"><option value="all">{t("teacher.allGroups")}</option>{TEACHER_GROUPS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <button onClick={() => { setExported(true); window.setTimeout(() => setExported(false), 1800); }} className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">{exported ? t("teacher.exported") : t("teacher.exportGrades")}</button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">{metrics.map((metric) => <Card key={metric.label}><p className="text-xs text-muted-foreground">{metric.label}</p><p className={cn("mt-2 text-2xl font-bold", metric.tone)}>{metric.value}</p><p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p></Card>)}</div>
      <Card className="space-y-3"><div className="flex items-center justify-between"><p className="text-sm font-semibold">{t("teacher.completionByGroup")}</p><span className="text-xs text-muted-foreground">{groupFilter === "all" ? t("teacher.allGroups") : TEACHER_GROUPS.find((item) => item.id === groupFilter)?.name}</span></div>{TEACHER_GROUPS.filter((item) => groupFilter === "all" || item.id === groupFilter).map((item, index) => { const value = [78, 64, 91][index] ?? 72; return <div key={item.id} className="space-y-1"><div className="flex justify-between text-xs"><span>{item.name}</span><span className="font-semibold">{value}%</span></div><ProgressBar value={value} /></div>; })}</Card>
      <Card><p className="mb-3 text-sm font-semibold">{t("admin.recent")}</p><div className="space-y-3 text-sm">{["G. Nurygdyyev published Week 4 — Motion", "D. Allanurov graded 12 submissions", "A. Ashyraliyeva updated group 2A"].map((item, index) => <div key={item} className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-primary" /><div><p>{item}</p><p className="text-xs text-muted-foreground">{index + 1} {index ? t("teacher.hoursAgo") : t("teacher.hourAgo")}</p></div></div>)}</div></Card>
    </div>
  );
}

export function StudentsPanel() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return students
      .map((s, i) => ({ s, pct: studentAttendance(i) }))
      .filter(({ s }) => !query || s.name.toLowerCase().includes(query) || s.studentCode.toLowerCase().includes(query));
  }, [q]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("teacher.searchStudents")}
          aria-label={t("teacher.searchStudents")}
          className="w-full rounded-xl border border-input bg-background py-3 pl-9 pr-4 text-sm outline-none focus:border-ring"
        />
      </div>
      {list.length === 0 ? (
        <EmptyState message={t("search.noResults")} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map(({ s, pct }) => (
            <Card key={s.id} className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
                {initials(s.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.studentCode} · {group.name}
                </p>
              </div>
              <Pill tone={pct >= 90 ? "success" : pct >= 80 ? "warning" : "danger"}>{pct}%</Pill>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
