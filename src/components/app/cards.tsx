import { Link } from "@tanstack/react-router";
import { Card, Pill, ProgressBar } from "./ui-kit";
import { useI18n } from "@/lib/i18n";
import {
  courseById,
  teacherOfCourse,
  type Announcement,
  type Assignment,
  type Course,
  type Exam,
  type Lesson,
  type Material,
  type Notification,
  type UniEvent,
  type Student,
  type Teacher,
} from "@/lib/demo-data";
import { Clock, MapPin, FileText, Link2, Video, Image as ImageIcon, FileType2, Presentation } from "lucide-react";

export type LessonStatus = "upcoming" | "inProgress" | "completed" | "cancelled";

export function lessonStatus(lesson: Lesson, now = new Date()): LessonStatus {
  if (lesson.cancelled) return "cancelled";
  const mins = now.getHours() * 60 + now.getMinutes();
  const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3));
  if (mins < toMin(lesson.start)) return "upcoming";
  if (mins <= toMin(lesson.end)) return "inProgress";
  return "completed";
}

const statusTone: Record<LessonStatus, string> = {
  upcoming: "primary",
  inProgress: "success",
  completed: "neutral",
  cancelled: "danger",
};

export function ScheduleCard({
  lesson,
  status,
  onClick,
}: {
  lesson: Lesson;
  status?: LessonStatus;
  onClick?: () => void;
}) {
  const { t } = useI18n();
  const course = courseById(lesson.courseId);
  const teacher = teacherOfCourse(lesson.courseId);
  const s = status ?? "upcoming";
  return (
    <button onClick={onClick} className="w-full text-left">
      <Card className="motion-card flex items-start gap-3 transition-transform active:scale-[0.99]">
        <div className="w-16 shrink-0">
          <p className="text-sm font-bold">{lesson.start}</p>
          <p className="text-xs text-muted-foreground">{lesson.end}</p>
        </div>
        <span className="mt-1 h-10 w-1 shrink-0 rounded-full" style={{ backgroundColor: course?.color }} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{course?.name}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {teacher?.name} · {t("schedule.room")} {lesson.room} · {t(`type.${lesson.type}`)}
          </p>
        </div>
        <Pill tone={statusTone[s]}>{t(`status.${s}`)}</Pill>
      </Card>
    </button>
  );
}

export function CourseCard({ course }: { course: Course }) {
  const { t } = useI18n();
  const teacher = teacherOfCourse(course.id);
  return (
    <Link to="/courses/$courseId" params={{ courseId: course.id }}>
      <Card className="motion-card h-full transition-transform hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold">{course.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {teacher?.name} · {course.credits} {t("courses.credits")}
            </p>
          </div>
          <Pill tone="primary">{course.grade}</Pill>
        </div>
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("courses.progress")}</span>
            <span>{course.progress}%</span>
          </div>
          <ProgressBar value={course.progress} color={course.color} />
        </div>
      </Card>
    </Link>
  );
}

const taskTone: Record<string, string> = {
  notStarted: "neutral",
  inProgress: "warning",
  submitted: "primary",
  late: "danger",
  graded: "success",
};

export function AssignmentCard({ a, onClick }: { a: Assignment; onClick?: () => void }) {
  const { t } = useI18n();
  const course = courseById(a.courseId);
  const due =
    a.dueInDays === 1
      ? t("tasks.dueTomorrow")
      : `${t("tasks.due")}: ${new Date(Date.now() + a.dueInDays * 86400000).toLocaleDateString()}`;
  return (
    <button onClick={onClick} className="w-full text-left">
      <Card className="motion-card flex items-start gap-3 transition-transform active:scale-[0.99]">
        <span className="mt-1 h-9 w-1 shrink-0 rounded-full" style={{ backgroundColor: course?.color }} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{a.title}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{course?.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{due}</p>
        </div>
        <Pill tone={taskTone[a.status] ?? "neutral"}>
          {a.status === "graded" && a.score ? `${a.score}/100` : t(`task.${a.status}`)}
        </Pill>
      </Card>
    </button>
  );
}

export function GradeCard({ courseId, total, letter }: { courseId: string; total: number; letter: string }) {
  const course = courseById(courseId);
  return (
    <Card className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{course?.name}</p>
        <div className="mt-2">
          <ProgressBar value={total} color={course?.color} />
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold">{total}/100</p>
        <p className="text-xs font-semibold text-primary">{letter}</p>
      </div>
    </Card>
  );
}

export function AttendanceCard({ courseId, percent }: { courseId: string; percent: number }) {
  const course = courseById(courseId);
  return (
    <Card className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{course?.name}</p>
        <div className="mt-2">
          <ProgressBar value={percent} color={percent < 90 ? "var(--warning)" : undefined} />
        </div>
      </div>
      <p className="font-bold">{percent}%</p>
    </Card>
  );
}

export function ExamCard({ exam }: { exam: Exam }) {
  const { t } = useI18n();
  const course = courseById(exam.courseId);
  const d = new Date(exam.date);
  return (
    <Card className="flex items-center gap-4">
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-soft text-primary">
        <span className="text-lg font-bold leading-none">{d.getDate()}</span>
        <span className="text-[10px] uppercase">{d.toLocaleString(undefined, { month: "short" })}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{course?.name}</p>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" /> {exam.time}
          <MapPin className="h-3 w-3" /> {exam.room}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{teacherOfCourse(exam.courseId)?.name}</p>
      </div>
      <Pill tone="primary">{t(`exam.${exam.type}`)}</Pill>
    </Card>
  );
}

const kindIcon = {
  pdf: FileText,
  docx: FileType2,
  pptx: Presentation,
  image: ImageIcon,
  link: Link2,
  video: Video,
} as const;

export function MaterialCard({ m }: { m: Material }) {
  const { t } = useI18n();
  const Icon = kindIcon[m.kind];
  return (
    <Card className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{m.title}</p>
        <p className="text-xs text-muted-foreground">
          {m.kind.toUpperCase()} · {m.size}
        </p>
      </div>
      <span className="text-sm font-semibold text-primary">{t("materials.download")}</span>
    </Card>
  );
}

export function AnnouncementCard({ a }: { a: Announcement }) {
  const { t } = useI18n();
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold">{a.title}</p>
        <Pill tone={a.category === "emergency" ? "danger" : a.important ? "warning" : "neutral"}>
          {t(`ann.${a.category}`)}
        </Pill>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{a.body}</p>
      <p className="mt-3 text-xs text-muted-foreground">
        {a.author} · {a.date}
      </p>
    </Card>
  );
}

function downloadIcs(e: UniEvent) {
  const start = new Date(e.date);
  const end = new Date(start.getTime() + 2 * 3600000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (s: string) => s.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Student TM//EN",
    "BEGIN:VEVENT",
    `UID:${e.id}@student.tm`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(e.title)}`,
    `LOCATION:${esc(e.place)}`,
    `DESCRIPTION:${esc(e.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${e.id}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export function EventCard({ e, registered, onRegister }: { e: UniEvent; registered: boolean; onRegister: () => void }) {
  const { t } = useI18n();
  const d = new Date(e.date);
  return (
    <Card>
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <span className="text-lg font-bold leading-none">{d.getDate()}</span>
          <span className="text-[10px] uppercase">{d.toLocaleString(undefined, { month: "short" })}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{e.title}</p>
          <p className="text-xs text-muted-foreground">{e.place}</p>
          <p className="mt-2 text-sm text-muted-foreground">{e.description}</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={onRegister}
          disabled={registered}
          className="tap-target flex-1 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:bg-success disabled:text-success-foreground"
        >
          {registered ? t("events.registered") : t("events.register")}
        </button>
        <button
          onClick={() => downloadIcs(e)}
          className="tap-target rounded-xl border border-border px-4 text-sm font-medium"
        >
          {t("events.addCalendar")}
        </button>
      </div>
    </Card>
  );
}

export function NotificationItem({ n, onRead }: { n: Notification; onRead: () => void }) {
  return (
    <button onClick={onRead} className="w-full text-left">
      <Card className={`flex items-start gap-3 ${n.read ? "opacity-70" : ""}`}>
        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-border" : "bg-primary"}`} />
        <div className="min-w-0 flex-1">
          <p className="text-sm">{n.text}</p>
          <p className="mt-1 text-xs text-muted-foreground">{n.time}</p>
        </div>
      </Card>
    </button>
  );
}

export function StudentCard({ s }: { s: Student }) {
  return (
    <Card className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">
        {s.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{s.name}</p>
        <p className="text-xs text-muted-foreground">{s.studentCode}</p>
      </div>
    </Card>
  );
}

export function TeacherCard({ teacher }: { teacher: Teacher }) {
  return (
    <Card className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
        {teacher.name.slice(0, 2)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{teacher.name}</p>
        <p className="truncate text-xs text-muted-foreground">{teacher.title}</p>
      </div>
    </Card>
  );
}
