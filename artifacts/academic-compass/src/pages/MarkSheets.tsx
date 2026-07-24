import { useState } from "react";
import { useSchool } from "@/store/school";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

export default function MarkSheets() {
  const { state, activeCurriculum, update } = useSchool();
  const [examFilter, setExamFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const exams = state.exams.filter(e => e.curriculumId === activeCurriculum);

  let sheets = state.sheets.filter(s => s.curriculumId === activeCurriculum);
  if (examFilter !== "all") sheets = sheets.filter(s => s.examId === examFilter);
  if (statusFilter !== "all") sheets = sheets.filter(s => s.status === statusFilter);

  const setStatus = (id: string, status: string) => update(s => {
    const sh = s.sheets.find(x => x.id === id);
    if (sh) { sh.status = status as typeof sh.status; sh.updatedAt = Date.now(); }
  });

  return (
    <div>
      <PageHeader title="Mark Sheets" description="Draft, submit, approve, publish. Lock/unlock, add teacher comments." />
      <div className="flex flex-wrap gap-2 mb-3">
        <Select value={examFilter} onValueChange={setExamFilter}>
          <SelectTrigger className="w-48"><SelectValue/></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All exams</SelectItem>
            {exams.map(e => <SelectItem key={e.id} value={e.id}>{e.name} · T{e.term}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue/></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="ml-auto self-center">{sheets.length} sheets</Badge>
      </div>

      <Card className="overflow-x-auto card-pad">
        <table className="data-table">
          <thead>
            <tr>
              <th>Subject</th><th>Class · Stream</th><th>Exam</th><th>Teacher</th>
              <th>Marks</th><th>Comment</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sheets.map(sh => {
              const sub     = state.subjects.find(x => x.id === sh.subjectId);
              const cls     = state.classes.find(c => c.id === sh.classId);
              const str     = state.streams.find(s => s.id === sh.streamId);
              const ex      = state.exams.find(e => e.id === sh.examId);
              const teacher = state.teachers.find(t => t.id === sh.teacherId);
              const entries = state.entries.filter(e => e.sheetId === sh.id);
              const filled  = entries.filter(e => e.score != null).length;
              return (
                <tr key={sh.id}>
                  <td className="font-medium">{sub?.name}</td>
                  <td>{cls?.name} · {str?.name}</td>
                  <td>{ex?.name}</td>
                  <td className="text-xs">{teacher?.name || "—"}</td>
                  <td>
                    <span className={filled < entries.length ? "text-warning-foreground" : "text-success"}>
                      {filled}/{entries.length}
                    </span>
                  </td>
                  <td className="max-w-[220px]">
                    <input className="inline-edit w-full text-xs" placeholder="Add comment…" value={sh.teacherComment || ""}
                      onChange={(e) => update(s => { const x = s.sheets.find(x => x.id === sh.id); if (x) x.teacherComment = e.target.value; })}/>
                  </td>
                  <td>
                    <select className="inline-edit text-xs" value={sh.status} onChange={(e) => setStatus(sh.id, e.target.value)}>
                      <option value="draft">Draft</option>
                      <option value="submitted">Submitted</option>
                      <option value="approved">Approved</option>
                      <option value="published">Published</option>
                    </select>
                  </td>
                  <td className="flex gap-1">
                    <Button asChild size="sm" variant="outline"><Link to={`/entry?sheet=${sh.id}`}>Open</Link></Button>
                    <Button size="icon" variant="ghost" title={sh.locked ? "Unlock" : "Lock"}
                      onClick={() => update(s => { const x = s.sheets.find(x => x.id === sh.id); if (x) x.locked = !x.locked; })}>
                      {sh.locked ? <Lock className="h-4 w-4 text-destructive"/> : <Unlock className="h-4 w-4"/>}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
