import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSchool } from "@/store/school";
import { useAuth } from "@/store/auth";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { statsForStudentExam } from "@/lib/schoolData";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Printer, ChevronLeft, ChevronRight, School } from "lucide-react";

export default function Reports() {
  const { state, activeCurriculum, update, setMarkScore } = useSchool();
  const { isPrincipal, canManageStudents, isTeacher, isSeniorTeacher } = useAuth();
  const canComment = isPrincipal || isSeniorTeacher || isTeacher;
  const canEditMarks = isPrincipal || isSeniorTeacher || isTeacher;
  const [params] = useSearchParams();

  const exams   = state.exams.filter(e => e.curriculumId === activeCurriculum && e.status !== "draft")
    .sort((a, b) => a.year - b.year || a.term - b.term);
  const classes = state.classes.filter(c => c.curriculumId === activeCurriculum);

  const [examId,    setExamId]    = useState<string>(params.get("exam") || exams[exams.length - 1]?.id || "");
  const [classId,   setClassId]   = useState<string>("");
  const [streamId,  setStreamId]  = useState<string>("");
  const [studentId, setStudentId] = useState<string>(params.get("student") || "");

  useEffect(() => {
    if (studentId) {
      const s = state.students.find(x => x.id === studentId);
      if (s) { setClassId(s.classId); setStreamId(s.streamId); }
    }
  }, [studentId]); // eslint-disable-line

  const streams = state.streams.filter(s => s.classId === classId);
  const studentsInStream = state.students.filter(s =>
    s.curriculumId === activeCurriculum &&
    (!classId  || s.classId  === classId) &&
    (!streamId || s.streamId === streamId)
  );

  useEffect(() => {
    if (!studentId && studentsInStream.length) setStudentId(studentsInStream[0].id);
  }, [studentsInStream.length]); // eslint-disable-line

  const student        = state.students.find(s => s.id === studentId);
  const exam           = state.exams.find(e => e.id === examId);
  const stats          = student && exam ? statsForStudentExam(state, student.id, exam.id) : null;
  const classRemark    = state.classRemarks.find(r => r.studentId === studentId && r.examId === examId);
  const principalRemark = state.principalRemarks.find(r => r.studentId === studentId && r.examId === examId);
  const cls            = student ? state.classes.find(c => c.id === student.classId) : null;
  const str            = student ? state.streams.find(s => s.id === student.streamId) : null;
  const classTeacher   = cls ? state.teachers.find(t => t.id === cls.classTeacherId) : null;

  const navigate = (dir: -1 | 1) => {
    const idx  = studentsInStream.findIndex(s => s.id === studentId);
    const next = studentsInStream[(idx + dir + studentsInStream.length) % studentsInStream.length];
    if (next) setStudentId(next.id);
  };

  const updateClassRemark = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!student || !exam) return;
    update(s => {
      const idx = s.classRemarks.findIndex(r => r.studentId === student.id && r.examId === exam.id);
      const entry = { studentId: student.id, examId: exam.id, remark: e.target.value, teacherName: classTeacher?.name || "", updatedAt: Date.now() };
      if (idx >= 0) s.classRemarks[idx] = entry;
      else s.classRemarks.push(entry);
    });
  };

  const updatePrincipalRemark = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!student || !exam) return;
    update(s => {
      const idx = s.principalRemarks.findIndex(r => r.studentId === student.id && r.examId === exam.id);
      const entry = { studentId: student.id, examId: exam.id, remark: e.target.value, principalName: "Dr. Joseph Mwangi", updatedAt: Date.now() };
      if (idx >= 0) s.principalRemarks[idx] = entry;
      else s.principalRemarks.push(entry);
    });
  };

  return (
    <div>
      <PageHeader
        title="Printable Report Forms"
        description="A4 report form per student per exam. Editable header, per-subject comments, class-teacher and principal remarks."
        actions={
          <div className="flex gap-1 no-print">
            <Button size="sm" variant="outline" onClick={() => navigate(-1)}><ChevronLeft className="h-4 w-4"/></Button>
            <Button size="sm" variant="outline" onClick={() => navigate(1)}><ChevronRight className="h-4 w-4"/></Button>
            <Button size="sm" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1"/>Print</Button>
          </div>
        }
      />

      <Card className="p-3 md:p-4 mb-4 no-print">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Select value={examId} onValueChange={setExamId}>
            <SelectTrigger><SelectValue placeholder="Exam"/></SelectTrigger>
            <SelectContent>{exams.map(e => <SelectItem key={e.id} value={e.id}>{e.name} · T{e.term} · {e.year}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={classId} onValueChange={(v) => { setClassId(v); setStreamId(""); setStudentId(""); }}>
            <SelectTrigger><SelectValue placeholder="Class / Grade"/></SelectTrigger>
            <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={streamId} onValueChange={(v) => { setStreamId(v); setStudentId(""); }} disabled={!classId}>
            <SelectTrigger><SelectValue placeholder="Stream"/></SelectTrigger>
            <SelectContent>{streams.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={studentId} onValueChange={setStudentId}>
            <SelectTrigger><SelectValue placeholder="Student"/></SelectTrigger>
            <SelectContent>{studentsInStream.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Tip: use Print with "Save as PDF" for bulk export. Navigate previous/next student with the arrows.
        </div>
      </Card>

      {student && exam && stats && (
        <div className="a4-sheet print-page">
          {/* Header */}
          <header className="flex items-center gap-4 border-b pb-4">
            <div className="h-16 w-16 rounded-lg bg-primary text-primary-foreground grid place-items-center shrink-0">
              <School className="h-8 w-8"/>
            </div>
            <div className="flex-1 min-w-0">
              <input className="inline-edit text-2xl font-bold tracking-tight w-full"
                value={state.settings.schoolName} disabled={!isPrincipal}
                onChange={(e) => update(s => { s.settings.schoolName = e.target.value; })}/>
              <input className="inline-edit text-xs text-muted-foreground w-full italic"
                value={state.settings.motto} disabled={!isPrincipal}
                onChange={(e) => update(s => { s.settings.motto = e.target.value; })}/>
              <div className="text-xs text-muted-foreground">{state.settings.address}</div>
            </div>
            <div className="text-right text-xs shrink-0">
              <div className="font-semibold text-sm">{exam.name.toUpperCase()} · TERM {exam.term} · {exam.year}</div>
              <div className="text-muted-foreground">{state.curricula.find(c => c.id === activeCurriculum)?.name}</div>
            </div>
          </header>

           {/* Student info */}
           <section className="grid grid-cols-2 md:grid-cols-4 gap-2 py-2 text-sm border-b">
             <Field label="Student name" value={student.name} disabled={!canManageStudents}
               onChange={(v) => update(s => { const x = s.students.find(x => x.id === student.id); if (x) x.name = v; })}/>
             <Field label="Admission No." value={student.admissionNo} disabled={!canManageStudents}
               onChange={(v) => update(s => { const x = s.students.find(x => x.id === student.id); if (x) x.admissionNo = v; })}/>
             <div>
               <div className="text-[10px] uppercase text-muted-foreground">Grade · Stream</div>
               <div className="font-medium">{cls?.name} · {str?.name}</div>
             </div>
             <div>
               <div className="text-[10px] uppercase text-muted-foreground">Mean · Grade</div>
               <div className="font-semibold">{stats.mean} · {stats.overallGrade}</div>
             </div>
             <div className="col-span-2 md:col-span-4">
               <div className="text-[10px] uppercase text-muted-foreground">Values · Attitudes · Personality (VAP)</div>
               <input className="inline-edit w-full" value={student.vap} disabled={!canManageStudents}
                 onChange={(e) => update(s => { const x = s.students.find(x => x.id === student.id); if (x) x.vap = e.target.value; })}/>
             </div>
             <div className="col-span-2 md:col-span-4">
               <div className="text-[10px] uppercase text-muted-foreground">School Fee Balance</div>
               <input className="inline-edit w-full" value={student.feeBalance ?? ""} disabled={!canManageStudents}
                 onChange={(e) => update(s => { const x = s.students.find(x => x.id === student.id); if (x) x.feeBalance = e.target.value ? Number(e.target.value) : undefined; })}/>
             </div>
           </section>

          {/* Chart */}
          <section className="py-3 border-b">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Performance across subjects</div>
            <div className="h-36 print:h-28">
              <ResponsiveContainer>
                <BarChart data={stats.rows.map(r => ({ subject: r.subject, score: r.score || 0 }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>
                  <XAxis dataKey="subject" stroke="#374151" fontSize={10}/>
                  <YAxis domain={[0,100]} ticks={[0,10,20,30,40,50,60,70,80,90,100]} stroke="#374151" fontSize={10}/>
                  <Tooltip/>
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[3,3,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Subject results */}
          <section className="py-3 border-b overflow-x-auto">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Subject results</div>
            <table className="w-full text-xs border min-w-[640px]">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-1.5 border">Subject</th>
                  <th className="text-left p-1.5 border w-12">Marks</th>
                  <th className="text-left p-1.5 border w-14">Dev.</th>
                  <th className="text-left p-1.5 border w-12">Grade</th>
                  <th className="text-left p-1.5 border w-16">Rank</th>
                  <th className="text-left p-1.5 border">Comment</th>
                  <th className="text-left p-1.5 border w-32">Teacher</th>
                </tr>
              </thead>
              <tbody>
                {stats.rows.map(r => (
                  <tr key={r.subjectId}>
                    <td className="p-1.5 border font-medium">{r.subject}</td>
                    <td className="p-1.5 border">
                      {canEditMarks ? (
                        <input
                          type="number"
                          className="inline-edit w-14 text-center"
                          defaultValue={r.score ?? ""}
                          disabled={!canEditMarks}
                          onBlur={(e) => {
                            const raw = e.target.value;
                            if (raw === "") {
                              setMarkScore(r.entryId, null);
                            } else {
                              const n = Number(raw);
                              if (!isNaN(n)) setMarkScore(r.entryId, n);
                            }
                          }}
                          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                        />
                      ) : (
                        r.score ?? "—"
                      )}
                    </td>
                    <td className={`p-1.5 border ${r.deviation > 0 ? "text-success" : r.deviation < 0 ? "text-destructive" : ""}`}>
                      {r.deviation > 0 ? "+" : ""}{r.deviation}
                    </td>
                    <td className="p-1.5 border">{r.grade}</td>
                    <td className="p-1.5 border">{r.rank || "—"}/{r.total}</td>
                    <td className="p-1.5 border">
                      <input className="inline-edit w-full text-xs" defaultValue={r.teacherComment}
                        disabled={!canComment}
                        onBlur={(e) => update(s => {
                          const sh = s.sheets.find(x => x.examId === exam.id && x.subjectId === r.subjectId && x.streamId === student.streamId);
                          if (sh) sh.teacherComment = e.target.value;
                        })}/>
                    </td>
                    <td className="p-1.5 border text-muted-foreground">{r.teacherName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Class teacher remarks */}
          <section className="py-2 border-b">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Class teacher's remarks</div>
            <Textarea className="text-sm min-h-[50px] print:min-h-[40px]" defaultValue={classRemark?.remark || state.settings.classTeacherRemarkTemplate}
              disabled={!canComment}
              onBlur={updateClassRemark}/>
            <div className="text-xs text-muted-foreground mt-1">Signed: {classTeacher?.name || "—"} · Date: {new Date().toLocaleDateString()}</div>
          </section>

          {/* Principal remarks */}
          <section className="py-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Principal's remarks</div>
            <Textarea className="text-sm min-h-[50px] print:min-h-[40px]" defaultValue={principalRemark?.remark || state.settings.principalRemarkTemplate}
              disabled={!isPrincipal}
              onBlur={updatePrincipalRemark}/>
            <div className="text-xs text-muted-foreground mt-1">
              Signed: {state.teachers.find(t => t.role === "principal")?.name || "Principal"} · Date: {new Date().toLocaleDateString()}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, disabled }: {
  label: string; value: string; onChange: (v: string) => void; disabled?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
      <input className="inline-edit w-full font-medium" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}/>
    </div>
  );
}
