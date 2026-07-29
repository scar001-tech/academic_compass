// Core data model for Scholaris academic performance app.
// Persisted to localStorage. Two curricula are separate top-level entities.

export type ID = string;

/** School departments — chosen at sign-up so the Principal can review role requests faster. */
export const DEPARTMENTS = [
  "Mathematics",
  "Languages (English & Kiswahili)",
  "Sciences",
  "Humanities & Social Studies",
  "Technical & Applied Sciences",
  "Creative Arts & Sports",
  "ICT / Computer Studies",
  "Religious Education",
  "Administration",
] as const;

export type Department = typeof DEPARTMENTS[number];

export type CurriculumId = "cbc" | "844";

export interface Curriculum {
  id: CurriculumId;
  name: string;
  shortName: string;
  description: string;
  gradingScale: GradeBand[];
}

export interface GradeBand {
  grade: string; // e.g. "A", "EE1"
  min: number;
  max: number;
  points: number;
  remark: string;
}

export interface SchoolClass {
  id: ID;
  curriculumId: CurriculumId;
  name: string; // "Grade 7" or "Form 3"
  classTeacherId?: ID;
}

export interface Stream {
  id: ID;
  classId: ID;
  name: string; // "Blue", "West"
}

export interface Subject {
  id: ID;
  curriculumId: CurriculumId;
  name: string;
  code: string;
  teacherId?: ID;
}

export interface Teacher {
  id: ID;
  name: string;
  email: string;
  phone?: string;
  role: "class_teacher" | "subject_teacher" | "principal" | "admin";
  curriculumIds: CurriculumId[];
}

export interface Student {
  id: ID;
  curriculumId: CurriculumId;
  admissionNo: string;
  name: string;
  gender: "M" | "F";
  classId: ID;
  streamId: ID;
  vap: string; // Values-Attitudes-Personality note
  guardianPhone?: string;
}

export interface Exam {
  id: ID;
  curriculumId: CurriculumId;
  name: string; // "Opener", "Midterm", "End Term"
  term: 1 | 2 | 3;
  year: number;
  outOf: number; // usually 100
  status: "draft" | "open" | "closed";
}

export type SheetStatus = "draft" | "submitted" | "approved" | "published";

export interface MarkSheet {
  id: ID;
  curriculumId: CurriculumId;
  classId: ID;
  streamId: ID;
  subjectId: ID;
  examId: ID;
  teacherId?: ID;
  teacherComment?: string;
  status: SheetStatus;
  locked: boolean;
  updatedAt: number;
}

export interface MarkEntry {
  id: ID;
  sheetId: ID;
  studentId: ID;
  score: number | null;
  overrideGrade?: string;
  updatedAt: number;
  updatedBy: string; // device name
  version?: number;  // optimistic locking version
  pending?: boolean; // offline pending sync
}


export interface ClassTeacherRemark {
  studentId: ID;
  examId: ID;
  remark: string;
  teacherName: string;
  updatedAt: number;
}

export interface PrincipalRemark {
  studentId: ID;
  examId: ID;
  remark: string;
  principalName: string;
  updatedAt: number;
}

export interface SyncConflict {
  id: ID;
  entity: "mark" | "comment" | "remark" | "student";
  studentId?: ID;
  subjectId?: ID;
  examId?: ID;
  field: string;
  serverValue: string;
  thisDeviceValue: string;
  otherDeviceValue?: string;
  editedBy: string;
  deviceName: string;
  otherDeviceName?: string;
  timestamp: number;
  status: "pending" | "resolved";
  resolution?: "server" | "this" | "other" | "custom";
  customValue?: string;
}

export interface TimetableSlot {
  id: ID;
  curriculumId: CurriculumId;
  classId: ID;
  streamId?: ID;
  dayOfWeek: number; // 0 = Monday … 4 = Friday
  period: number;
  startTime?: string;
  endTime?: string;
  subjectId?: ID;
  teacherId?: ID;
  room?: string;
  version?: number;
  updatedAt?: number;
  updatedBy?: string;
  pending?: boolean;
}

export interface SchoolSettings {
  schoolName: string;
  motto: string;
  address: string;
  academicYear: number;
  classTeacherRemarkTemplate: string;
  principalRemarkTemplate: string;
}

export interface AppState {
  settings: SchoolSettings;
  curricula: Curriculum[];
  classes: SchoolClass[];
  streams: Stream[];
  subjects: Subject[];
  teachers: Teacher[];
  students: Student[];
  exams: Exam[];
  sheets: MarkSheet[];
  entries: MarkEntry[];
  classRemarks: ClassTeacherRemark[];
  principalRemarks: PrincipalRemark[];
  conflicts: SyncConflict[];
  timetable: TimetableSlot[];
  online: boolean;
  deviceName: string;
  syncQueue: string[]; // entry ids awaiting sync
  lastSyncAt: number | null;
}

// ---------- Grading ----------

const cbcScale: GradeBand[] = [
  { grade: "EE1", min: 90, max: 100, points: 12, remark: "Exceeding Expectation" },
  { grade: "EE2", min: 76, max: 89, points: 11, remark: "Exceeding Expectation" },
  { grade: "ME1", min: 58, max: 75, points: 9, remark: "Meeting Expectation" },
  { grade: "ME2", min: 41, max: 57, points: 7, remark: "Meeting Expectation" },
  { grade: "AE1", min: 31, max: 40, points: 5, remark: "Approaching Expectation" },
  { grade: "AE2", min: 21, max: 30, points: 3, remark: "Approaching Expectation" },
  { grade: "BE", min: 0, max: 20, points: 1, remark: "Below Expectation" },
];

const kcseScale: GradeBand[] = [
  { grade: "A", min: 80, max: 100, points: 12, remark: "Excellent" },
  { grade: "A-", min: 75, max: 79, points: 11, remark: "Very Good" },
  { grade: "B+", min: 70, max: 74, points: 10, remark: "Very Good" },
  { grade: "B", min: 65, max: 69, points: 9, remark: "Good" },
  { grade: "B-", min: 60, max: 64, points: 8, remark: "Good" },
  { grade: "C+", min: 55, max: 59, points: 7, remark: "Above Average" },
  { grade: "C", min: 50, max: 54, points: 6, remark: "Average" },
  { grade: "C-", min: 45, max: 49, points: 5, remark: "Average" },
  { grade: "D+", min: 40, max: 44, points: 4, remark: "Below Average" },
  { grade: "D", min: 35, max: 39, points: 3, remark: "Weak" },
  { grade: "D-", min: 30, max: 34, points: 2, remark: "Weak" },
  { grade: "E", min: 0, max: 29, points: 1, remark: "Very Weak" },
];

export function gradeFor(score: number | null | undefined, scale: GradeBand[]): GradeBand | null {
  if (score == null || isNaN(score)) return null;
  return scale.find((b) => score >= b.min && score <= b.max) ?? null;
}

export function createMarkSheetsForExam(state: AppState, exam: Exam): { sheets: MarkSheet[]; entries: MarkEntry[] } {
  const sheets: MarkSheet[] = [];
  const entries: MarkEntry[] = [];
  const now = Date.now();

  const curriculumSubjects = state.subjects.filter(s => s.curriculumId === exam.curriculumId);
  const curriculumStreams = state.streams.filter(str => {
    const cls = state.classes.find(c => c.id === str.classId);
    return cls?.curriculumId === exam.curriculumId;
  });
  const curriculumStudents = state.students.filter(s => s.curriculumId === exam.curriculumId);

  curriculumStreams.forEach((stream) => {
    const cls = state.classes.find(c => c.id === stream.classId);
    if (!cls) return;
    curriculumSubjects.forEach((subject) => {
      const sheetId = `sh_${exam.id}_${stream.id}_${subject.id}`;
      sheets.push({
        id: sheetId,
        curriculumId: exam.curriculumId,
        classId: cls.id,
        streamId: stream.id,
        subjectId: subject.id,
        examId: exam.id,
        teacherId: subject.teacherId,
        status: "draft",
        locked: false,
        updatedAt: now,
      });

      const streamStudents = curriculumStudents.filter(s => s.streamId === stream.id);
      streamStudents.forEach((stu) => {
        entries.push({
          id: `e_${sheetId}_${stu.id}`,
          sheetId,
          studentId: stu.id,
          score: null,
          updatedAt: now,
          updatedBy: state.deviceName,
        });
      });
    });
  });

  return { sheets, entries };
}

// ---------- Seed ----------

const uid = (p: string, i: number) => `${p}_${i}`;

function seed(): AppState {
  const curricula: Curriculum[] = [
    { id: "cbc", name: "CBC / Junior School", shortName: "CBC", description: "Competency-Based Curriculum", gradingScale: cbcScale },
    { id: "844", name: "8-4-4 / Senior School", shortName: "8-4-4", description: "KCSE senior school curriculum", gradingScale: kcseScale },
  ];

  // Classes
  const classes: SchoolClass[] = [
    { id: "cls_cbc_g10", curriculumId: "cbc", name: "Grade 10" },
    { id: "cls_cbc_g11", curriculumId: "cbc", name: "Grade 11" },
    { id: "cls_cbc_g12", curriculumId: "cbc", name: "Grade 12" },
    { id: "cls_844_f3", curriculumId: "844", name: "Form 3" },
    { id: "cls_844_f4", curriculumId: "844", name: "Form 4" },
  ];

  // Streams
  const streams: Stream[] = [
    { id: "str_g10_blue", classId: "cls_cbc_g10", name: "Blue" },
    { id: "str_g10_gold", classId: "cls_cbc_g10", name: "Gold" },
    { id: "str_g11_blue", classId: "cls_cbc_g11", name: "Blue" },
    { id: "str_g12_blue", classId: "cls_cbc_g12", name: "Blue" },
    { id: "str_f3_east", classId: "cls_844_f3", name: "East" },
    { id: "str_f3_west", classId: "cls_844_f3", name: "West" },
    { id: "str_f4_east", classId: "cls_844_f4", name: "East" },
  ];

  // Teachers
  const teachers: Teacher[] = [
    { id: "t1", name: "Mrs. Achieng Otieno", email: "achieng@school.ac.ke", role: "class_teacher", curriculumIds: ["cbc"] },
    { id: "t2", name: "Mr. Kimani Njoroge", email: "kimani@school.ac.ke", role: "subject_teacher", curriculumIds: ["cbc","844"] },
    { id: "t3", name: "Ms. Wanjiru Kariuki", email: "wanjiru@school.ac.ke", role: "subject_teacher", curriculumIds: ["cbc"] },
    { id: "t4", name: "Mr. Owuor Onyango", email: "owuor@school.ac.ke", role: "class_teacher", curriculumIds: ["844"] },
    { id: "t5", name: "Mrs. Mumbi Kamau", email: "mumbi@school.ac.ke", role: "subject_teacher", curriculumIds: ["844"] },
    { id: "t6", name: "Dr. Joseph Mwangi", email: "principal@school.ac.ke", role: "principal", curriculumIds: ["cbc","844"] },
  ];

  // Update class teachers
  classes[0].classTeacherId = "t1";
  classes[1].classTeacherId = "t3";
  classes[2].classTeacherId = "t1";
  classes[3].classTeacherId = "t4";
  classes[4].classTeacherId = "t4";

  // Subjects
  const cbcSubjects = [
    { name: "Mathematics", code: "MAT", teacherId: "t2" },
    { name: "English", code: "ENG", teacherId: "t3" },
    { name: "Kiswahili", code: "KIS", teacherId: "t1" },
    { name: "Integrated Science", code: "SCI", teacherId: "t2" },
    { name: "Social Studies", code: "SST", teacherId: "t3" },
    { name: "Creative Arts", code: "CRE", teacherId: "t1" },
  ];
  const kcseSubjects = [
    { name: "Mathematics", code: "MAT", teacherId: "t2" },
    { name: "English", code: "ENG", teacherId: "t5" },
    { name: "Kiswahili", code: "KIS", teacherId: "t5" },
    { name: "Biology", code: "BIO", teacherId: "t2" },
    { name: "Chemistry", code: "CHE", teacherId: "t4" },
    { name: "Physics", code: "PHY", teacherId: "t4" },
    { name: "Geography", code: "GEO", teacherId: "t5" },
  ];
  const subjects: Subject[] = [
    ...cbcSubjects.map((s, i) => ({ id: uid("sub_cbc", i), curriculumId: "cbc" as const, ...s })),
    ...kcseSubjects.map((s, i) => ({ id: uid("sub_844", i), curriculumId: "844" as const, ...s })),
  ];

  // Students
  const cbcNames = [
    ["Amani","Wekesa","F"], ["Baraka","Mutiso","M"], ["Chebet","Kipkurui","F"],
    ["Dennis","Ochieng","M"], ["Esther","Njoki","F"], ["Faith","Akinyi","F"],
    ["Gideon","Barasa","M"], ["Halima","Yusuf","F"], ["Ian","Kipchoge","M"], ["Jacqueline","Mwende","F"],
  ] as const;
  const kcseNames = [
    ["Ibrahim","Hassan","M"], ["Jane","Wambui","F"], ["Kevin","Otieno","M"],
    ["Lilian","Chepkoech","F"], ["Moses","Kiptoo","M"], ["Neema","Ali","F"],
    ["Oscar","Mwenda","M"], ["Purity","Njeri","F"],
  ] as const;
  let sIdx = 0;
  const students: Student[] = [];
  cbcNames.forEach((n, i) => {
    const classId = i < 3 ? "cls_cbc_g10" : i < 6 ? "cls_cbc_g11" : "cls_cbc_g12";
    const streamId = classId === "cls_cbc_g10" ? (i < 2 ? "str_g10_blue" : "str_g10_gold") : classId === "cls_cbc_g11" ? "str_g11_blue" : "str_g12_blue";
    students.push({
      id: uid("stu", sIdx++), curriculumId: "cbc", admissionNo: `CBC/${100 + i}/26`,
      name: `${n[0]} ${n[1]}`, gender: n[2] as "M"|"F",
      classId, streamId,
      vap: "Diligent learner. Participates actively in class discussions.",
    });
  });
  kcseNames.forEach((n, i) => {
    const classId = i < 5 ? "cls_844_f3" : "cls_844_f4";
    const streamId = i < 3 ? "str_f3_east" : i < 5 ? "str_f3_west" : "str_f4_east";
    students.push({
      id: uid("stu", sIdx++), curriculumId: "844", admissionNo: `KCSE/${200 + i}/26`,
      name: `${n[0]} ${n[1]}`, gender: n[2] as "M"|"F",
      classId, streamId,
      vap: "Responsible and consistent. Shows leadership potential.",
    });
  });

  // Exams
  const exams: Exam[] = [
    { id: "ex_cbc_opener", curriculumId: "cbc", name: "Opener", term: 1, year: 2026, outOf: 100, status: "closed" },
    { id: "ex_cbc_mid",    curriculumId: "cbc", name: "Midterm", term: 1, year: 2026, outOf: 100, status: "open" },
    { id: "ex_cbc_end",    curriculumId: "cbc", name: "End Term", term: 1, year: 2026, outOf: 100, status: "draft" },
    { id: "ex_844_opener", curriculumId: "844", name: "Opener", term: 1, year: 2026, outOf: 100, status: "closed" },
    { id: "ex_844_mid",    curriculumId: "844", name: "Midterm", term: 1, year: 2026, outOf: 100, status: "open" },
  ];

  // Mark sheets: one per (subject × stream × exam) for a couple exams
  const sheets: MarkSheet[] = [];
  const entries: MarkEntry[] = [];
  const now = Date.now();
  const rng = mulberry32(42);

  const makeSheets = (curriculumId: CurriculumId, examIds: ID[]) => {
    const cSubs = subjects.filter(s => s.curriculumId === curriculumId);
    const cStudents = students.filter(s => s.curriculumId === curriculumId);
    const cStreams = streams.filter(str => classes.find(c => c.id === str.classId)?.curriculumId === curriculumId);
    examIds.forEach((examId, exIdx) => {
      cStreams.forEach((str) => {
        const cls = classes.find(c => c.id === str.classId)!;
        cSubs.forEach((sub) => {
          const sheetId = `sh_${examId}_${str.id}_${sub.id}`;
          const status: SheetStatus = exIdx === 0 ? "published" : exIdx === 1 ? "submitted" : "draft";
          sheets.push({
            id: sheetId, curriculumId, classId: cls.id, streamId: str.id,
            subjectId: sub.id, examId, teacherId: sub.teacherId,
            teacherComment: exIdx === 0 ? "Overall improved performance. Keep it up." : "",
            status, locked: status === "published", updatedAt: now - exIdx * 86400000,
          });
          const streamStudents = cStudents.filter(s => s.streamId === str.id);
          streamStudents.forEach((stu, si) => {
            const base = 40 + Math.floor(rng() * 55);
            const subjectBias = (sub.code.charCodeAt(0) % 7) - 3;
            const score = exIdx === 2 ? null : Math.max(15, Math.min(98, base + subjectBias + (exIdx === 1 ? 3 : 0)));
            entries.push({
              id: `e_${sheetId}_${stu.id}`,
              sheetId, studentId: stu.id, score,
              updatedAt: now - exIdx * 86400000 - si * 1000,
              updatedBy: "Server",
            });
          });
        });
      });
    });
  };
  makeSheets("cbc", ["ex_cbc_opener","ex_cbc_mid","ex_cbc_end"]);
  makeSheets("844", ["ex_844_opener","ex_844_mid"]);

  // Sample conflicts
  const conflicts: SyncConflict[] = [
    {
      id: "cf1", entity: "mark",
      studentId: students[0].id, subjectId: "sub_cbc_0", examId: "ex_cbc_mid",
      field: "score", serverValue: "72", thisDeviceValue: "78", otherDeviceValue: "75",
      editedBy: "Mr. Kimani Njoroge", deviceName: "Tablet-KIM-01", otherDeviceName: "Phone-KIM-02",
      timestamp: now - 3600000, status: "pending",
    },
    {
      id: "cf2", entity: "comment",
      subjectId: "sub_cbc_1", examId: "ex_cbc_mid",
      field: "teacherComment", serverValue: "Good progress.", thisDeviceValue: "Excellent progress in reading.",
      editedBy: "Ms. Wanjiru Kariuki", deviceName: "Laptop-WAN",
      timestamp: now - 7200000, status: "pending",
    },
    {
      id: "cf3", entity: "remark",
      studentId: students[10].id, examId: "ex_844_opener",
      field: "classTeacherRemark", serverValue: "Working hard.", thisDeviceValue: "Improved discipline and academics.",
      editedBy: "Mr. Owuor Onyango", deviceName: "Phone-OWU",
      timestamp: now - 10800000, status: "pending",
    },
  ];

  // Class teacher & principal remarks (samples)
  const classRemarks: ClassTeacherRemark[] = [];
  const principalRemarks: PrincipalRemark[] = [];
  students.forEach((s) => {
    exams.filter(e => e.curriculumId === s.curriculumId && e.status !== "draft").forEach((e) => {
      classRemarks.push({
        studentId: s.id, examId: e.id,
        remark: "Shows consistent effort. Encouraged to seek help in weaker areas.",
        teacherName: teachers.find(t => t.id === classes.find(c => c.id === s.classId)?.classTeacherId)?.name ?? "",
        updatedAt: now,
      });
      principalRemarks.push({
        studentId: s.id, examId: e.id,
        remark: "A commendable performance. Aim higher next term.",
        principalName: "Dr. Joseph Mwangi",
        updatedAt: now,
      });
    });
  });

  return {
    settings: {
      schoolName: "Uhuru Academy",
      motto: "Knowledge · Integrity · Excellence",
      address: "P.O Box 1234-00100, Nairobi",
      academicYear: 2026,
      classTeacherRemarkTemplate: "Shows consistent effort. Encouraged to seek help in weaker areas.",
      principalRemarkTemplate: "A commendable performance. Aim higher next term.",
    },
    curricula, classes, streams, subjects, teachers, students, exams,
    sheets, entries, classRemarks, principalRemarks, conflicts,
    timetable: [],
    online: true, deviceName: "This Device",
    syncQueue: [], lastSyncAt: now,
  };
}

// deterministic RNG
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const KEY = "scholaris_v1";
const EMPTY_PRODUCTION_DATA = import.meta.env.VITE_EMPTY_PRODUCTION_DATA === "true";

function emptyState(): AppState {
  const now = Date.now();
  return {
    settings: {
      schoolName: "",
      motto: "",
      address: "",
      academicYear: new Date().getFullYear(),
      classTeacherRemarkTemplate: "",
      principalRemarkTemplate: "",
    },
    curricula: [
      { id: "cbc", name: "CBC / Junior School", shortName: "CBC", description: "Competency-Based Curriculum", gradingScale: cbcScale },
      { id: "844", name: "8-4-4 / Senior School", shortName: "8-4-4", description: "KCSE senior school curriculum", gradingScale: kcseScale },
    ],
    classes: [],
    streams: [],
    subjects: [],
    teachers: [],
    students: [],
    exams: [],
    sheets: [],
    entries: [],
    classRemarks: [],
    principalRemarks: [],
    conflicts: [],
    timetable: [],
    online: true,
    deviceName: "This Device",
    syncQueue: [],
    lastSyncAt: now,
  };
}

function initialState(): AppState {
  return EMPTY_PRODUCTION_DATA ? emptyState() : seed();
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const s = initialState();
  localStorage.setItem(KEY, JSON.stringify(s));
  return s;
}

export function saveState(s: AppState) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function resetState(): AppState {
  const s = initialState();
  saveState(s);
  return s;
}

// ---------- Derived helpers ----------

export interface StudentSubjectStat {
  subjectId: ID;
  subject: string;
  score: number | null;
  grade: string;
  rank: number;
  total: number;
  deviation: number; // vs stream mean
  teacherComment: string;
  teacherName: string;
  entryId: ID;
}

export function statsForStudentExam(
  state: AppState, studentId: ID, examId: ID,
): { rows: StudentSubjectStat[]; mean: number; totalPoints: number; overallGrade: string } {
  const student = state.students.find(s => s.id === studentId)!;
  const exam = state.exams.find(e => e.id === examId)!;
  const curriculum = state.curricula.find(c => c.id === student.curriculumId)!;
  const subjectSheets = state.sheets.filter(
    sh => sh.examId === examId && sh.streamId === student.streamId
  );
  const rows: StudentSubjectStat[] = [];
  subjectSheets.forEach((sh) => {
    const sub = state.subjects.find(s => s.id === sh.subjectId);
    if (!sub) return;
    const allEntries = state.entries.filter(e => e.sheetId === sh.id && e.score != null);
    const sorted = [...allEntries].sort((a, b) => (b.score! - a.score!));
    const mine = state.entries.find(e => e.sheetId === sh.id && e.studentId === studentId);
    const score = mine?.score ?? null;
    const rank = score != null ? sorted.findIndex(e => e.studentId === studentId) + 1 : 0;
    const mean = sorted.length ? sorted.reduce((a, b) => a + (b.score ?? 0), 0) / sorted.length : 0;
    const gb = gradeFor(score, curriculum.gradingScale);
    const teacher = state.teachers.find(t => t.id === sh.teacherId);
    rows.push({
      subjectId: sub.id, subject: sub.name, score,
      grade: mine?.overrideGrade || gb?.grade || "—",
      rank, total: sorted.length,
      deviation: score != null ? Math.round((score - mean) * 10) / 10 : 0,
      teacherComment: sh.teacherComment || "",
      teacherName: teacher?.name ?? "",
      entryId: mine?.id || "",
    });
  });
  const validRows = rows.filter(r => r.score != null);
  const mean = validRows.length ? validRows.reduce((a, r) => a + (r.score ?? 0), 0) / validRows.length : 0;
  const totalPoints = validRows.reduce((a, r) => a + (gradeFor(r.score, curriculum.gradingScale)?.points || 0), 0);
  const overallGrade = gradeFor(mean, curriculum.gradingScale)?.grade || "—";
  return { rows: validRows, mean: Math.round(mean * 10) / 10, totalPoints, overallGrade };
}

export function identifyWeakAreas(
  state: AppState, studentId: ID,
): { subject: string; latestScore: number; trend: "up" | "down" | "flat"; reason: string }[] {
  const student = state.students.find(s => s.id === studentId)!;
  const exams = state.exams
    .filter(e => e.curriculumId === student.curriculumId && e.status !== "draft")
    .sort((a, b) => a.year - b.year || a.term - b.term);
  const subs = state.subjects.filter(s => s.curriculumId === student.curriculumId);
  const out: { subject: string; latestScore: number; trend: "up"|"down"|"flat"; reason: string }[] = [];
  subs.forEach((sub) => {
    const seq: number[] = [];
    exams.forEach((ex) => {
      const sh = state.sheets.find(s => s.examId === ex.id && s.subjectId === sub.id && s.streamId === student.streamId);
      if (!sh) return;
      const e = state.entries.find(en => en.sheetId === sh.id && en.studentId === studentId);
      if (e?.score != null) seq.push(e.score);
    });
    if (!seq.length) return;
    const latest = seq[seq.length - 1];
    const first = seq[0];
    const trend: "up"|"down"|"flat" = seq.length < 2 ? "flat" : latest > first + 2 ? "up" : latest < first - 2 ? "down" : "flat";
    const reasons: string[] = [];
    if (latest < 50) reasons.push("Low mark");
    if (trend === "down") reasons.push("Downward trend");
    if (reasons.length) {
      out.push({ subject: sub.name, latestScore: latest, trend, reason: reasons.join(" · ") });
    }
  });
  return out;
}
