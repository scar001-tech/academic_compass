import { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useSchool } from "@/store/school";
import { useAuth } from "@/store/auth";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { gradeFor } from "@/lib/schoolData";
import { AlertTriangle, Cloud, CloudOff, Save, Lock } from "lucide-react";
import { toast } from "sonner";
import type { MarkEntry } from "@/lib/schoolData";

export default function MarkEntry() {
  const { state, activeCurriculum, update, setMarkScore, syncNow } = useSchool();
  const { isTeacher, isSeniorTeacher, isPrincipal } = useAuth();
  const [params, setParams] = useSearchParams();

  const canEnterMarks = isPrincipal || isSeniorTeacher || isTeacher;

  if (!canEnterMarks) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-4">
        <Card className="w-full max-w-md p-6 text-center space-y-4">
          <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
          <h1 className="text-lg font-bold">Access Restricted</h1>
          <p className="text-sm text-muted-foreground">
            Only teachers and above can enter marks. Please contact the Principal for access.
          </p>
        </Card>
      </div>
    );
  }

  const preSheet = params.get("sheet");
  const preSheetObj = state.sheets.find(s => s.id === preSheet);

  const [classId, setClassId]     = useState<string>(preSheetObj?.classId || "");
  const [streamId, setStreamId]   = useState<string>(preSheetObj?.streamId || "");
  const [subjectId, setSubjectId] = useState<string>(preSheetObj?.subjectId || "");
  const [examId, setExamId]       = useState<string>(preSheetObj?.examId || "");

  const classes  = state.classes.filter(c => c.curriculumId === activeCurriculum);
  const streams  = state.streams.filter(s => s.classId === classId);
  const subjects = state.subjects.filter(s => s.curriculumId === activeCurriculum);
  const exams    = state.exams.filter(e => e.curriculumId === activeCurriculum);
  const curriculum = state.curricula.find(c => c.id === activeCurriculum)!;

  const sheet = useMemo(() => state.sheets.find(s =>
    s.classId === classId && s.streamId === streamId && s.subjectId === subjectId && s.examId === examId
  ), [state.sheets, classId, streamId, subjectId, examId]);

  const students = state.students.filter(s => s.streamId === streamId);
  const entries  = sheet ? state.entries.filter(e => e.sheetId === sheet.id) : [];

  useEffect(() => {
    if (preSheet && preSheetObj) {
      setClassId(preSheetObj.classId);
      setStreamId(preSheetObj.streamId);
      setSubjectId(preSheetObj.subjectId);
      setExamId(preSheetObj.examId);
    }
  }, [preSheet]); // eslint-disable-line

  const initializedRef = useRef("");
  useEffect(() => {
    const key = `${examId}::${streamId}::${students.length}`;
    if (key === initializedRef.current || !examId || !streamId) return;
    initializedRef.current = key;

    const s = state;
    const relevantSheets = s.sheets.filter(sh => sh.examId === examId && sh.streamId === streamId);
    const missing: MarkEntry[] = [];
    relevantSheets.forEach(sheet => {
      s.students.filter(stu => stu.streamId === streamId).forEach(stu => {
        const exists = s.entries.some(e => e.sheetId === sheet.id && e.studentId === stu.id);
        if (!exists) {
          missing.push({
            id: `e_${sheet.id}_${stu.id}_${Math.random().toString(36).slice(2, 7)}`,
            sheetId: sheet.id,
            studentId: stu.id,
            score: null,
            updatedAt: Date.now(),
            updatedBy: s.deviceName,
            pending: true,
          });
        }
      });
    });
    if (missing.length > 0) {
      update(s => { s.entries.push(...missing); });
    }
  }, [examId, streamId, students.length, update]);

  const pendingCount = entries.filter(e => e.pending).length;
  const missingCount = entries.filter(e => e.score == null).length;

  const changeScore = (studentId: string, subjectId: string, raw: string) => {
    const sheetForSubject = state.sheets.find(s => s.subjectId === subjectId && s.examId === examId && s.streamId === streamId);
    if (!sheetForSubject) return;

    if (raw === "") {
      const existing = state.entries.find(e => e.sheetId === sheetForSubject.id && e.studentId === studentId);
      if (existing) {
        update(s => {
          const e = s.entries.find(x => x.id === existing.id);
          if (e) {
            e.score = null;
            e.updatedAt = Date.now();
            e.updatedBy = s.deviceName;
            e.pending = true;
          }
        });
      }
      return;
    }

    const n = Number(raw);
    if (isNaN(n)) {
      toast.error("Invalid number");
      return;
    }
    const outOf = state.exams.find(e => e.id === examId)?.outOf || 100;
    if (n < 0 || n > outOf) {
      toast.error(`Score must be 0–${outOf}`);
      return;
    }

    update(s => {
      let e = s.entries.find(x => x.sheetId === sheetForSubject.id && x.studentId === studentId);
      if (!e) {
        e = {
          id: `e_${sheetForSubject.id}_${studentId}_${Date.now()}`,
          sheetId: sheetForSubject.id,
          studentId,
          score: n,
          updatedAt: Date.now(),
          updatedBy: s.deviceName,
          pending: true,
        };
        s.entries.push(e);
      } else {
        e.score = n;
        e.updatedAt = Date.now();
        e.updatedBy = s.deviceName;
        e.pending = true;
      }
      if (!s.syncQueue.includes(e.id)) s.syncQueue.push(e.id);
    });

    if (state.online) syncNow();
  };

  return (
    <div>
      <PageHeader
        title="Offline Mark Entry"
        description="Enter marks anywhere. Changes queue locally when offline and sync when reconnected."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={state.online ? "border-success text-success" : "border-destructive text-destructive"}>
              {state.online ? <><Cloud className="h-3 w-3 mr-1"/>Online</> : <><CloudOff className="h-3 w-3 mr-1"/>Offline</>}
            </Badge>
            {pendingCount > 0 && <Badge className="bg-warning text-warning-foreground">{pendingCount} queued</Badge>}
            <Button size="sm" disabled={!state.online || pendingCount === 0} onClick={syncNow}>
              <Save className="h-4 w-4 mr-1"/>Sync now
            </Button>
          </div>
        }
      />

      <Card className="p-3 md:p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Select value={classId} onValueChange={(v) => { setClassId(v); setStreamId(""); }}>
            <SelectTrigger><SelectValue placeholder="Class / Grade"/></SelectTrigger>
            <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={streamId} onValueChange={setStreamId} disabled={!classId}>
            <SelectTrigger><SelectValue placeholder="Stream"/></SelectTrigger>
            <SelectContent>{streams.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={subjectId} onValueChange={setSubjectId}>
            <SelectTrigger><SelectValue placeholder="Subject"/></SelectTrigger>
            <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={examId} onValueChange={setExamId}>
            <SelectTrigger><SelectValue placeholder="Exam"/></SelectTrigger>
            <SelectContent>{exams.map(e => <SelectItem key={e.id} value={e.id}>{e.name} · T{e.term}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </Card>

      {!sheet && (classId || streamId || subjectId || examId) && (
        <Card className="p-6 text-center text-muted-foreground">
          <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-warning"/>
          No matching mark sheet. Pick a full combination that exists, or create the exam sheet from Exams/Sheets.
        </Card>
      )}

      {sheet && (
        <Card className="overflow-hidden card-pad">
          <div className="p-3 border-b flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="font-medium text-sm">
                {state.subjects.find(s => s.id === sheet.subjectId)?.name} · {state.classes.find(c => c.id === sheet.classId)?.name} {state.streams.find(s => s.id === sheet.streamId)?.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {state.exams.find(e => e.id === sheet.examId)?.name} · Status: {sheet.status} {sheet.locked ? "· 🔒 locked" : ""}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {missingCount > 0 && <span className="chip bg-warning-soft text-warning-foreground border-warning">{missingCount} missing</span>}
              {pendingCount > 0 && <span className="chip bg-info-soft text-info border-info">{pendingCount} pending sync</span>}
              <span className="text-muted-foreground">Updated {new Date(sheet.updatedAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 border-b">
            <label className="text-xs text-muted-foreground">Subject teacher comment</label>
            <Input value={sheet.teacherComment || ""} placeholder="Overall comment for this sheet…"
              onChange={(e) => update(s => { const x = s.sheets.find(x => x.id === sheet.id); if (x) x.teacherComment = e.target.value; })} />
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Adm. No.</th><th>Student</th><th className="w-28">Score</th><th>Grade</th><th>Status</th></tr>
              </thead>
              <tbody>
                {students.map((stu, i) => {
                  const e  = entries.find(x => x.studentId === stu.id);
                  const gb = gradeFor(e?.score ?? null, curriculum.gradingScale);
                  return (
                    <tr key={stu.id}>
                      <td className="text-muted-foreground">{i+1}</td>
                      <td className="font-mono text-xs">{stu.admissionNo}</td>
                      <td className="font-medium">{stu.name}</td>
                      <td>
                        <Input
                          type="number" min={0} max={100}
                          className="h-9 w-24"
                          disabled={sheet.locked}
                          defaultValue={e?.score ?? ""}
                          onBlur={(ev) => changeScore(stu.id, sheet.subjectId, ev.target.value)}
                          onKeyDown={(ev) => { if (ev.key === "Enter") (ev.target as HTMLInputElement).blur(); }}
                        />
                      </td>
                      <td>{gb ? <span className="chip bg-primary-soft text-primary border-primary/30">{gb.grade}</span> : <span className="text-muted-foreground">—</span>}</td>
                      <td className="text-xs">
                        {e?.pending
                          ? <span className="chip bg-warning-soft text-warning-foreground border-warning">edited offline</span>
                          : e?.score != null ? <span className="chip bg-success-soft text-success border-success">saved</span>
                          : <span className="chip bg-muted text-muted-foreground">missing</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
