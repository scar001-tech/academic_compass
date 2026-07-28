import { useMemo, useState, useEffect, useRef } from "react";
import { useSchool } from "@/store/school";
import { useAuth } from "@/store/auth";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { gradeFor } from "@/lib/schoolData";
import { Cloud, CloudOff, Download, Lock } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import type { MarkEntry } from "@/lib/schoolData";

export default function Marks() {
  const { state, activeCurriculum, update, setMarkScore, syncNow } = useSchool();
  const { isTeacher, isSeniorTeacher, isPrincipal } = useAuth();
  const stateRef = useRef(state);
  stateRef.current = state;

  const canEnterMarks = isPrincipal || isSeniorTeacher || isTeacher;

  if (!canEnterMarks) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-4">
        <Card className="w-full max-w-md p-6 text-center space-y-4">
          <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
          <h1 className="text-lg font-bold">Access Restricted</h1>
          <p className="text-sm text-muted-foreground">
            Only teachers and above can view and enter exam marks.
          </p>
        </Card>
      </div>
    );
  }

  const [classId, setClassId] = useState("");
  const [streamId, setStreamId] = useState("");
  const [examId, setExamId] = useState("");

  const classes  = state.classes.filter(c => c.curriculumId === activeCurriculum);
  const streams  = state.streams.filter(s => s.classId === classId);
  const exams    = state.exams.filter(e => e.curriculumId === activeCurriculum);

  const sheets = useMemo(() => {
    if (!examId || !streamId) return [];
    return state.sheets.filter(s => s.examId === examId && s.streamId === streamId);
  }, [state.sheets, examId, streamId]);

  const subjects = useMemo(() => {
    const subjectIds = new Set(sheets.map(s => s.subjectId));
    return state.subjects
      .filter(s => subjectIds.has(s.id) && s.curriculumId === activeCurriculum)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [sheets, state.subjects, activeCurriculum]);

  const students = useMemo(() => {
    if (!streamId) return [];
    return state.students.filter(s => s.streamId === streamId).sort((a, b) => a.name.localeCompare(b.name));
  }, [state.students, streamId]);

  const curriculum = state.curricula.find(c => c.id === activeCurriculum)!;

  const initializedRef = useRef("");
  useEffect(() => {
    const key = `${examId}::${streamId}`;
    if (key === initializedRef.current || !examId || !streamId) return;
    initializedRef.current = key;

    const s = stateRef.current;
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
  }, [examId, streamId, update]);

  const matrix = useMemo(() => {
    const result: Record<string, Record<string, { entryId: string; score: number | null; grade: string }>> = {};
    students.forEach(stu => {
      result[stu.id] = {};
      subjects.forEach(sub => {
        const sheet = sheets.find(s => s.subjectId === sub.id);
        if (!sheet) return;
        const entry = state.entries.find(e => e.sheetId === sheet.id && e.studentId === stu.id);
        const score = entry?.score ?? null;
        const gb = gradeFor(score, curriculum.gradingScale);
        result[stu.id][sub.id] = {
          entryId: entry?.id || "",
          score,
          grade: gb?.grade || "—",
        };
      });
    });
    return result;
  }, [students, subjects, sheets, state.entries, curriculum]);

  const studentStats = useMemo(() => {
    const stats: Record<string, { total: number; count: number; average: number; grade: string; position: number }> = {};
    const totals: { id: string; total: number }[] = [];
    students.forEach(stu => {
      const row = matrix[stu.id];
      let total = 0;
      let count = 0;
      subjects.forEach(sub => {
        const cell = row[sub.id];
        if (cell && cell.score != null) {
          total += cell.score;
          count++;
        }
      });
      const average = count ? Math.round(total / count * 10) / 10 : 0;
      const gb = gradeFor(average, curriculum.gradingScale);
      totals.push({ id: stu.id, total });
      stats[stu.id] = { total, count, average, grade: gb?.grade || "—", position: 0 };
    });

    const sorted = [...totals].sort((a, b) => b.total - a.total);
    students.forEach(stu => {
      stats[stu.id].position = sorted.findIndex(x => x.id === stu.id) + 1;
    });

    return stats;
  }, [students, subjects, matrix, curriculum]);

  const changeScore = (studentId: string, subjectId: string, raw: string) => {
    const sheet = sheets.find(s => s.subjectId === subjectId);
    if (!sheet) return;
    const entry = state.entries.find(e => e.sheetId === sheet.id && e.studentId === studentId);
    if (!entry) {
      toast.error("Mark entry not found. Please try again.");
      return;
    }
    if (raw === "") {
      setMarkScore(entry.id, null);
      return;
    }
    const n = Number(raw);
    const outOf = state.exams.find(e => e.id === examId)?.outOf || 100;
    if (isNaN(n) || n < 0 || n > outOf) {
      toast.error(`Score must be 0–${outOf}`);
      return;
    }
    setMarkScore(entry.id, n);
  };

  const exportMarks = () => {
    const data = students.map(stu => {
      const stats = studentStats[stu.id];
      const row: Record<string, any> = {
        "Adm. No.": stu.admissionNo,
        "Name": stu.name,
      };
      subjects.forEach(sub => {
        const cell = matrix[stu.id]?.[sub.id];
        row[sub.name] = cell?.score ?? "";
      });
      row["Total"] = stats.total;
      row["Average"] = stats.average;
      row["Grade"] = stats.grade;
      row["Position"] = stats.position;
      return row;
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Marks");
    XLSX.writeFile(workbook, `marks-${examId}-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Marks exported as Excel");
  };

  const pendingCount = state.entries.filter(e => e.pending).length;

  return (
    <div>
      <PageHeader
        title="Exam Marks"
        description="View and edit marks for all subjects in a selected exam."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={state.online ? "border-success text-success" : "border-destructive text-destructive"}>
              {state.online ? <><Cloud className="h-3 w-3 mr-1" />Online</> : <><CloudOff className="h-3 w-3 mr-1" />Offline</>}
            </Badge>
            {pendingCount > 0 && <Badge className="bg-warning text-warning-foreground">{pendingCount} queued</Badge>}
            <Button size="sm" variant="outline" disabled={!state.online || pendingCount === 0} onClick={syncNow}>
              <Cloud className="h-4 w-4 mr-1" />Sync
            </Button>
            <Button size="sm" variant="outline" onClick={exportMarks} disabled={!examId || !streamId || students.length === 0}>
              <Download className="h-4 w-4 mr-1" />Export
            </Button>
          </div>
        }
      />

      <Card className="p-3 md:p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <Select value={examId} onValueChange={setExamId}>
            <SelectTrigger><SelectValue placeholder="Exam" /></SelectTrigger>
            <SelectContent>
              {exams.map(e => <SelectItem key={e.id} value={e.id}>{e.name} · T{e.term}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={classId} onValueChange={(v) => { setClassId(v); setStreamId(""); }}>
            <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
            <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={streamId} onValueChange={setStreamId} disabled={!classId}>
            <SelectTrigger><SelectValue placeholder="Stream" /></SelectTrigger>
            <SelectContent>{streams.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </Card>

      {!examId || !streamId ? (
        <Card className="p-6 text-center text-muted-foreground">
          Select an exam and stream to view marks.
        </Card>
      ) : subjects.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          No subjects found for this exam and stream.
        </Card>
      ) : (
        <Card className="overflow-x-auto card-pad">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Adm. No.</th>
                  <th>Student</th>
                  {subjects.map(sub => <th key={sub.id} className="text-center whitespace-nowrap">{sub.code || sub.name}</th>)}
                  <th className="text-center">Total</th>
                  <th className="text-center">Avg</th>
                  <th className="text-center">Grade</th>
                  <th className="text-center">Pos</th>
                </tr>
              </thead>
              <tbody>
                {students.map((stu, i) => {
                  const stats = studentStats[stu.id];
                  return (
                    <tr key={stu.id}>
                      <td className="text-muted-foreground">{i + 1}</td>
                      <td className="font-mono text-xs">{stu.admissionNo}</td>
                      <td className="font-medium">{stu.name}</td>
                      {subjects.map(sub => {
                        const cell = matrix[stu.id]?.[sub.id];
                        return (
                          <td key={sub.id} className="text-center">
                            <Input
                              type="number"
                              className="h-8 w-16 text-center mx-auto"
                              disabled={!canEnterMarks}
                              defaultValue={cell?.score ?? ""}
                              onBlur={(ev) => {
                                if (cell?.entryId) changeScore(stu.id, sub.id, ev.target.value);
                              }}
                              onKeyDown={(ev) => {
                                if (ev.key === "Enter") (ev.target as HTMLInputElement).blur();
                              }}
                            />
                          </td>
                        );
                      })}
                      <td className="text-center font-medium">{stats.total}</td>
                      <td className="text-center">{stats.average}</td>
                      <td className="text-center">{stats.grade}</td>
                      <td className="text-center">{stats.position}</td>
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
