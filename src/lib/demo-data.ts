// Demo dataset for Student TM.
// Shape mirrors the planned relational schema (universities -> faculties ->
// departments -> programs -> groups -> students) so it can be swapped for a
// real backend without touching the UI layer.

export type Role = "student" | "teacher" | "admin" | "superadmin";

export interface University {
  id: string;
  name: string;
  shortName: string;
  city: string;
}
export interface Faculty {
  id: string;
  universityId: string;
  name: string;
}
export interface Department {
  id: string;
  facultyId: string;
  name: string;
}
export interface Program {
  id: string;
  departmentId: string;
  name: string;
  degree: string;
}
export interface Group {
  id: string;
  programId: string;
  name: string;
  year: number;
}
export interface Teacher {
  id: string;
  universityId: string;
  departmentId: string;
  name: string;
  title: string;
  email: string;
}
export interface Student {
  id: string;
  universityId: string;
  facultyId: string;
  programId: string;
  groupId: string;
  studentCode: string;
  name: string;
  email: string;
  phone: string;
  year: number;
  photo: string;
}
export interface Course {
  id: string;
  universityId: string;
  programId: string;
  code: string;
  name: string;
  teacherId: string;
  credits: number;
  progress: number;
  grade: number;
  color: string;
}
export type LessonType = "lecture" | "seminar" | "lab" | "practice";
export interface Lesson {
  id: string;
  courseId: string;
  groupId: string;
  weekday: number; // 1 = Monday
  start: string;
  end: string;
  room: string;
  type: LessonType;
  notes?: string;
  cancelled?: boolean;
}
export type TaskStatus = "notStarted" | "inProgress" | "submitted" | "late" | "graded";
export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueInDays: number;
  status: TaskStatus;
  score?: number;
  attachments: { name: string; type: string }[];
}
export interface GradeRow {
  id: string;
  courseId: string;
  midterm: number;
  final: number;
  assignments: number;
  exams: number;
  total: number;
  letter: string;
}
export interface AttendanceCourse {
  courseId: string;
  percent: number;
  history: { date: string; status: "present" | "absent" | "late" | "excused" }[];
}
export interface Exam {
  id: string;
  courseId: string;
  date: string;
  time: string;
  room: string;
  type: "midterm" | "final" | "quiz";
}
export interface Material {
  id: string;
  courseId: string;
  title: string;
  kind: "pdf" | "docx" | "pptx" | "image" | "link" | "video";
  size: string;
}
export type AnnCategory = "university" | "faculty" | "department" | "group" | "emergency" | "event";
export interface Announcement {
  id: string;
  title: string;
  body: string;
  author: string;
  date: string;
  category: AnnCategory;
  important?: boolean;
}
export interface UniEvent {
  id: string;
  title: string;
  date: string;
  place: string;
  description: string;
}
export interface Notification {
  id: string;
  kind: "assignment" | "deadline" | "grade" | "schedule" | "exam" | "announcement" | "event" | "attendance";
  text: string;
  time: string;
  read: boolean;
}

export const university: University = {
  id: "u1",
  name: "International University for the Humanities and Development",
  shortName: "IUHD",
  city: "Aşgabat",
};
export const faculty: Faculty = { id: "f1", universityId: "u1", name: "Faculty of Digital Technologies" };
export const department: Department = { id: "d1", facultyId: "f1", name: "Department of Software Engineering" };
export const program: Program = { id: "p1", departmentId: "d1", name: "Software", degree: "Bachelor" };
export const group: Group = { id: "g1", programId: "p1", name: "1B", year: 1 };

export const teachers: Teacher[] = [
  { id: "t1", universityId: "u1", departmentId: "d1", name: "G. Nurygdyyev", title: "Lecturer", email: "g.nurygdyyev@iuhd.edu.tm" },
  { id: "t2", universityId: "u1", departmentId: "d1", name: "D. Allanurov", title: "Lecturer", email: "d.allanurov@iuhd.edu.tm" },
  { id: "t3", universityId: "u1", departmentId: "d1", name: "A. Ashyraliyeva", title: "Lecturer", email: "a.ashyraliyeva@iuhd.edu.tm" },
  { id: "t4", universityId: "u1", departmentId: "d1", name: "O. Mamikov", title: "Lecturer", email: "o.mamikov@iuhd.edu.tm" },
  { id: "t5", universityId: "u1", departmentId: "d1", name: "G. Yarashova", title: "Lecturer", email: "g.yarashova@iuhd.edu.tm" },
  { id: "t6", universityId: "u1", departmentId: "d1", name: "A. Gurbanmuradyev", title: "Lecturer", email: "a.gurbanmuradyev@iuhd.edu.tm" },
  { id: "t7", universityId: "u1", departmentId: "d1", name: "J. Ashirbayev", title: "Lecturer", email: "j.ashirbayev@iuhd.edu.tm" },
  { id: "t8", universityId: "u1", departmentId: "d1", name: "G. Gutlyyeva", title: "Lecturer", email: "g.gutlyyeva@iuhd.edu.tm" },
];

export const courses: Course[] = [
  { id: "c1", universityId: "u1", programId: "p1", code: "PHY", name: "Physics", teacherId: "t1", credits: 3, progress: 48, grade: 78, color: "oklch(0.64 0.13 60)" },
  { id: "c2", universityId: "u1", programId: "p1", code: "ESP", name: "English for Special Purposes", teacherId: "t2", credits: 4, progress: 74, grade: 92, color: "oklch(0.6 0.12 200)" },
  { id: "c3", universityId: "u1", programId: "p1", code: "CALC", name: "Calculus", teacherId: "t3", credits: 4, progress: 61, grade: 81, color: "oklch(0.62 0.13 150)" },
  { id: "c4", universityId: "u1", programId: "p1", code: "IP", name: "Introduction to Programming", teacherId: "t4", credits: 5, progress: 68, grade: 87, color: "oklch(0.55 0.15 262)" },
  { id: "c5", universityId: "u1", programId: "p1", code: "CCT", name: "Contemporary Computer Technologies", teacherId: "t5", credits: 5, progress: 57, grade: 85, color: "oklch(0.58 0.14 290)" },
  { id: "c6", universityId: "u1", programId: "p1", code: "PE", name: "Physical Education", teacherId: "t6", credits: 2, progress: 80, grade: 94, color: "oklch(0.6 0.13 30)" },
  { id: "c7", universityId: "u1", programId: "p1", code: "ISE", name: "Introduction to Software Engineering", teacherId: "t7", credits: 4, progress: 70, grade: 89, color: "oklch(0.6 0.12 330)" },
  { id: "c8", universityId: "u1", programId: "p1", code: "FTL", name: "Foundations of Turkmenistan’s Legislation", teacherId: "t8", credits: 3, progress: 40, grade: 83, color: "oklch(0.56 0.14 240)" },
];

const T = (h: number, m = 0) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

export const lessons: Lesson[] = [
  { id: "l1", courseId: "c1", groupId: "g1", weekday: 1, start: "09:00", end: "10:20", room: "—", type: "seminar" },
  { id: "l2", courseId: "c2", groupId: "g1", weekday: 1, start: "10:30", end: "11:50", room: "—", type: "lecture" },
  { id: "l3", courseId: "c3", groupId: "g1", weekday: 1, start: "12:10", end: "13:30", room: "—", type: "seminar" },
  { id: "l4", courseId: "c4", groupId: "g1", weekday: 2, start: "09:00", end: "10:20", room: "—", type: "practice" },
  { id: "l5", courseId: "c5", groupId: "g1", weekday: 2, start: "10:30", end: "11:50", room: "—", type: "lecture" },
  { id: "l6", courseId: "c6", groupId: "g1", weekday: 2, start: "12:10", end: "13:30", room: "—", type: "lecture" },
  { id: "l7", courseId: "c4", groupId: "g1", weekday: 3, start: "09:00", end: "10:20", room: "—", type: "lecture" },
  { id: "l8", courseId: "c7", groupId: "g1", weekday: 3, start: "10:30", end: "11:50", room: "—", type: "lecture" },
  { id: "l9", courseId: "c3", groupId: "g1", weekday: 3, start: "12:10", end: "13:30", room: "—", type: "lecture" },
  { id: "l10", courseId: "c8", groupId: "g1", weekday: 4, start: "09:00", end: "10:20", room: "—", type: "seminar" },
  { id: "l11", courseId: "c8", groupId: "g1", weekday: 4, start: "10:30", end: "11:50", room: "—", type: "lecture" },
  { id: "l12", courseId: "c5", groupId: "g1", weekday: 4, start: "12:10", end: "13:30", room: "—", type: "practice" },
  { id: "l13", courseId: "c4", groupId: "g1", weekday: 5, start: "09:00", end: "10:20", room: "—", type: "seminar" },
  { id: "l14", courseId: "c1", groupId: "g1", weekday: 5, start: "10:30", end: "11:50", room: "—", type: "lecture" },
  { id: "l15", courseId: "c2", groupId: "g1", weekday: 6, start: "09:00", end: "10:20", room: "—", type: "lecture" },
  { id: "l16", courseId: "c7", groupId: "g1", weekday: 6, start: "10:30", end: "11:50", room: "—", type: "practice" },
];

export const assignments: Assignment[] = [
  { id: "a1", courseId: "c2", title: "Prepare presentation", description: "Prepare a 5-minute presentation about a modern IT company.", dueInDays: 1, status: "inProgress", attachments: [{ name: "brief.pdf", type: "pdf" }] },
  { id: "a2", courseId: "c1", title: "Lab report: loops", description: "Solve 10 tasks with for/while loops and submit a report.", dueInDays: 2, status: "notStarted", attachments: [{ name: "tasks.pdf", type: "pdf" }] },
  { id: "a3", courseId: "c3", title: "Problem set 4", description: "Derivatives and limits, problems 1–20.", dueInDays: 4, status: "notStarted", attachments: [] },
  { id: "a4", courseId: "c8", title: "Personal landing page", description: "Build a responsive landing page with HTML and CSS.", dueInDays: 6, status: "inProgress", attachments: [{ name: "spec.docx", type: "docx" }] },
  { id: "a5", courseId: "c4", title: "Binary arithmetic worksheet", description: "Convert and calculate in binary and hex.", dueInDays: 8, status: "notStarted", attachments: [] },
  { id: "a6", courseId: "c6", title: "Essay: Ancient Merv", description: "1000-word essay about the historical role of Merv.", dueInDays: -2, status: "graded", score: 94, attachments: [] },
  { id: "a7", courseId: "c2", title: "Vocabulary test prep", description: "Study units 4–6 vocabulary.", dueInDays: -5, status: "graded", score: 88, attachments: [] },
  { id: "a8", courseId: "c1", title: "Functions practice", description: "Write 6 reusable functions with tests.", dueInDays: -1, status: "submitted", attachments: [] },
  { id: "a9", courseId: "c5", title: "Kinematics lab", description: "Measure acceleration and report the results.", dueInDays: 9, status: "notStarted", attachments: [{ name: "lab-sheet.pdf", type: "pdf" }] },
  { id: "a10", courseId: "c7", title: "Reading comprehension", description: "Read the text and answer the questions.", dueInDays: 3, status: "notStarted", attachments: [] },
  { id: "a11", courseId: "c3", title: "Matrix exercises", description: "Practice matrix multiplication.", dueInDays: -3, status: "late", attachments: [] },
  { id: "a12", courseId: "c8", title: "Flexbox challenge", description: "Recreate the given layout using flexbox.", dueInDays: 11, status: "notStarted", attachments: [] },
  { id: "a13", courseId: "c4", title: "Algorithms quiz prep", description: "Review sorting and searching algorithms.", dueInDays: 5, status: "notStarted", attachments: [] },
  { id: "a14", courseId: "c6", title: "Timeline poster", description: "Create a visual timeline of the 20th century.", dueInDays: 13, status: "notStarted", attachments: [] },
  { id: "a15", courseId: "c1", title: "Mini project: calculator", description: "Build a console calculator application.", dueInDays: 14, status: "notStarted", attachments: [] },
];

export const grades: GradeRow[] = courses.map((c, i) => {
  const total = c.grade;
  const letter = total >= 90 ? "A" : total >= 87 ? "B+" : total >= 80 ? "B" : total >= 75 ? "C+" : "C";
  return {
    id: `gr${i + 1}`,
    courseId: c.id,
    midterm: Math.min(100, total - 4 + (i % 5)),
    final: Math.min(100, total + 2 - (i % 3)),
    assignments: Math.min(100, total + 3 - (i % 4)),
    exams: Math.min(100, total - 2 + (i % 3)),
    total,
    letter,
  };
});

export const gpa = 3.72;

const attStatuses = ["present", "present", "present", "late", "present", "absent", "present", "excused", "present", "present"] as const;
export const attendance: AttendanceCourse[] = courses.map((c, i) => ({
  courseId: c.id,
  percent: [90, 95, 88, 92, 86, 97, 93, 91][i] ?? 90,
  history: attStatuses.map((s, j) => ({
    date: new Date(Date.now() - (j + 1) * 86400000 * 2).toISOString().slice(0, 10),
    status: (i + j) % 7 === 0 ? "absent" : (i + j) % 5 === 0 ? "late" : s,
  })),
}));

export const exams: Exam[] = [
  { id: "e1", courseId: "c2", date: "2026-06-12", time: "10:00", room: "301", type: "final" },
  { id: "e2", courseId: "c1", date: "2026-06-15", time: "09:00", room: "204", type: "final" },
  { id: "e3", courseId: "c3", date: "2026-06-18", time: "11:00", room: "108", type: "final" },
  { id: "e4", courseId: "c4", date: "2026-05-04", time: "09:00", room: "201", type: "midterm" },
  { id: "e5", courseId: "c8", date: "2026-05-11", time: "14:00", room: "IT-2", type: "quiz" },
];

export const materials: Material[] = [
  { id: "m1", courseId: "c1", title: "Lecture 1 — Introduction", kind: "pdf", size: "1.2 MB" },
  { id: "m2", courseId: "c1", title: "Lecture 2 — Variables", kind: "pdf", size: "980 KB" },
  { id: "m3", courseId: "c1", title: "Algorithms basics", kind: "pdf", size: "2.4 MB" },
  { id: "m4", courseId: "c2", title: "Unit 4 vocabulary", kind: "docx", size: "220 KB" },
  { id: "m5", courseId: "c2", title: "IT presentation template", kind: "pptx", size: "3.1 MB" },
  { id: "m6", courseId: "c3", title: "Derivatives cheat sheet", kind: "pdf", size: "640 KB" },
  { id: "m7", courseId: "c4", title: "Number systems", kind: "image", size: "410 KB" },
  { id: "m8", courseId: "c8", title: "MDN CSS reference", kind: "link", size: "—" },
  { id: "m9", courseId: "c8", title: "Flexbox in 15 minutes", kind: "video", size: "—" },
  { id: "m10", courseId: "c5", title: "Kinematics lab sheet", kind: "pdf", size: "780 KB" },
];

export const announcements: Announcement[] = [
  { id: "n1", title: "Exam session schedule published", body: "The summer exam session runs from 10 to 25 June. Check your personal timetable.", author: "Academic Office", date: "2026-05-02", category: "university", important: true },
  { id: "n2", title: "Library closed on Friday", body: "The main library will be closed for inventory on Friday.", author: "Library", date: "2026-05-01", category: "university" },
  { id: "n3", title: "Faculty meeting for first-year students", body: "All first-year students of Digital Technologies must attend at 15:00, Main Hall.", author: "Dean's Office", date: "2026-04-29", category: "faculty", important: true },
  { id: "n4", title: "Software department office hours", body: "New office hours: Monday–Friday, 10:00–16:00.", author: "Software Department", date: "2026-04-27", category: "department" },
  { id: "n5", title: "SOFT-1B: room change", body: "Monday Mathematics moves from 108 to 110 next week.", author: "Gowher Yarashowa", date: "2026-04-26", category: "group" },
  { id: "n6", title: "Fire drill on Wednesday", body: "A campus-wide fire drill takes place at 11:00. Follow staff instructions.", author: "Security", date: "2026-04-25", category: "emergency", important: true },
  { id: "n7", title: "English Week is coming", body: "Register for competitions and workshops in the events section.", author: "Language Centre", date: "2026-04-24", category: "event" },
  { id: "n8", title: "Scholarship applications open", body: "Submit your documents to the Academic Office before 20 May.", author: "Academic Office", date: "2026-04-22", category: "university" },
  { id: "n9", title: "New study materials uploaded", body: "Programming Fundamentals lectures 1–3 are available.", author: "Gowher Yarashowa", date: "2026-04-20", category: "group" },
  { id: "n10", title: "Student ID renewal", body: "First-year students can collect renewed IDs at the registry.", author: "Registry", date: "2026-04-18", category: "university" },
];

export const events: UniEvent[] = [
  { id: "ev1", title: "English Week", date: "2026-09-25", place: "Main Hall", description: "A week of language competitions, debates and film screenings." },
  { id: "ev2", title: "Programming Workshop", date: "2026-10-02", place: "IT Center", description: "Hands-on workshop on building your first web application." },
  { id: "ev3", title: "Student Conference", date: "2026-10-15", place: "Conference Hall", description: "Annual student research conference with poster sessions." },
  { id: "ev4", title: "Career Day", date: "2026-11-05", place: "Main Hall", description: "Meet IT companies from Ashgabat and discuss internships." },
  { id: "ev5", title: "Sport Festival", date: "2026-11-20", place: "Campus Stadium", description: "Inter-faculty football, volleyball and athletics." },
];

export const notifications: Notification[] = [
  { id: "nt1", kind: "deadline", text: "Your English for IT presentation is due tomorrow.", time: "1h", read: false },
  { id: "nt2", kind: "grade", text: "History of Turkmenistan essay graded: 94/100.", time: "3h", read: false },
  { id: "nt3", kind: "schedule", text: "Friday Computer Science seminar has been cancelled.", time: "5h", read: false },
  { id: "nt4", kind: "assignment", text: "New assignment in Web Technologies: Personal landing page.", time: "1d", read: true },
  { id: "nt5", kind: "exam", text: "Programming Fundamentals final exam on 15 June, room 204.", time: "1d", read: true },
  { id: "nt6", kind: "announcement", text: "Exam session schedule published.", time: "2d", read: true },
  { id: "nt7", kind: "event", text: "Registration for the Programming Workshop is open.", time: "3d", read: true },
  { id: "nt8", kind: "attendance", text: "Your Physics attendance dropped to 86%.", time: "4d", read: true },
  { id: "nt9", kind: "grade", text: "Mathematics problem set graded: 81/100.", time: "5d", read: true },
  { id: "nt10", kind: "assignment", text: "New assignment in Mathematics: Problem set 4.", time: "6d", read: true },
];

const studentNames = [
  "Abbaskaramzad Suleyman",
  "Arslanov Agajan",
  "Ashyralyyev Urayym",
  "Atajanov Arslan",
  "Atajanov Dilshatbek",
  "Bazarbayeva Gulnazik",
  "Bayramova Meryem",
  "Esenova Tavus",
  "Galpakov Sohbet",
  "Gaylyyeva Gulruh",
  "Gulnazarov Ysmayyl",
  "Gurbangeldiyev Kerim",
  "Muhammova Aygulq",
  "Muradova Bahar",
  "Narmedov Maksat",
  "Nurberdiyev Muhammetemin",
  "Orazgeldiyev Kowusmyrat",
  "Owezov Ahmet",
  "Sahedov Selim",
  "Yazymov Yhlas",
];

export const students: Student[] = studentNames.map((name, i) => ({
  id: `s${i + 1}`,
  universityId: "u1",
  facultyId: "f1",
  programId: "p1",
  groupId: "g1",
  studentCode: `TM-2026-${String(i + 1).padStart(4, "0")}`,
  name,
  email: i === 0 ? "student@student.tm" : `${name.split(" ")[0]!.toLowerCase()}${i}@student.tm`,
  phone: `+993 6${String(1000000 + i * 1237).slice(0, 7)}`,
  year: 1,
  photo: "",
}));

export const currentStudent = students[0]!;

export const courseById = (id: string) => courses.find((c) => c.id === id);
export const teacherById = (id: string) => teachers.find((t) => t.id === id);
export const teacherOfCourse = (courseId: string) => teacherById(courseById(courseId)?.teacherId ?? "");
