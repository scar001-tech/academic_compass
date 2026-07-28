import { useState, useRef } from "react";
import { useSchool } from "@/store/school";
import { useAuth } from "@/store/auth";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Trash2, Lock, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function Students() {
  const { state, activeCurriculum, update } = useSchool();
  const { canManageStudents } = useAuth();
  const [q, setQ] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [streamFilter, setStreamFilter] = useState<string>("all");
  const fileRef = useRef<HTMLInputElement>(null);
  const classes = state.classes.filter(c => c.curriculumId === activeCurriculum);
  const streams = state.streams.filter(s => classFilter === "all" || s.classId === classFilter);
  const students = state.students.filter(s => s.curriculumId === activeCurriculum)
    .filter(s => classFilter === "all" || s.classId === classFilter)
    .filter(s => streamFilter === "all" || s.streamId === streamFilter)
    .filter(s => !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.admissionNo.toLowerCase().includes(q.toLowerCase()));

  const addStudent = () => {
    if (!canManageStudents) { toast.error("Only the Principal or Senior Teacher can add learners"); return; }
    const cls = classes[0];
    if (!cls) { toast.error("Create a class first"); return; }
    const stream = state.streams.find(s => s.classId === cls.id);
    if (!stream) { toast.error("Create a stream first"); return; }
    update((s) => {
      const id = `stu_${Date.now()}`;
      s.students.push({
        id, curriculumId: activeCurriculum, admissionNo: `NEW/${s.students.length+1}/${s.settings.academicYear}`,
        name: "New Student", gender: "M", classId: cls.id, streamId: stream.id, vap: "",
      });
    });
    toast.success("Student added — edit their details inline");
  };

  const removeStudent = (id: string) => {
    if (!canManageStudents) { toast.error("Only the Principal or Senior Teacher can remove learners"); return; }
    update(st => { st.students = st.students.filter(x => x.id !== id); });
  };

  const exportStudents = () => {
    const target = students.filter(s => streamFilter === "all" || s.streamId === streamFilter);
    const data = target.map(s => {
      const cls = state.classes.find(c => c.id === s.classId);
      const stream = state.streams.find(st => st.id === s.streamId);
      return {
        AdmissionNo: s.admissionNo,
        Name: s.name,
        Gender: s.gender,
        Class: cls?.name || "",
        Stream: stream?.name || "",
        VAP: s.vap || "",
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    const suffix = streamFilter !== "all" ? `stream-${streamFilter}` : activeCurriculum;
    XLSX.writeFile(workbook, `students-${suffix}-${new Date().toISOString().slice(0,10)}.xlsx`);
    toast.success(`Exported ${data.length} students`);
  };

  const importStudents = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<any>(sheet);
        if (!Array.isArray(json) || json.length === 0) throw new Error("Invalid format");
        update((s) => {
          json.forEach((row) => {
            const name = String(row.Name || row.StudentName || "New Student");
            const admissionNo = String(row.AdmissionNo || row.Admission || `IMP/${Date.now()}/${s.settings.academicYear}`);
            const gender = ["M", "F"].includes(String(row.Gender)) ? String(row.Gender) : "M";
            const className = String(row.Class || "");
            const streamName = String(row.Stream || "");
            const vap = String(row.VAP || row.vap || "");
            let classId = classFilter !== "all" ? classFilter : (classes[0]?.id || "");
            let streamId = "";
            if (className) {
              const foundClass = s.classes.find(c => c.name.toLowerCase() === className.toLowerCase() && c.curriculumId === activeCurriculum);
              if (foundClass) classId = foundClass.id;
            }
            if (streamName && classId) {
              const foundStream = s.streams.find(st => st.classId === classId && st.name.toLowerCase() === streamName.toLowerCase());
              if (foundStream) streamId = foundStream.id;
            }
            if (!streamId && classId) {
              const fallback = s.streams.find(st => st.classId === classId);
              if (fallback) streamId = fallback.id;
            }
            if (streamFilter !== "all" && !streamId) {
              const filtered = s.streams.find(st => st.id === streamFilter);
              if (filtered) streamId = filtered.id;
            }
            s.students.push({
              id: `stu_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              curriculumId: activeCurriculum,
              admissionNo,
              name,
              gender: gender as "M" | "F",
              classId,
              streamId,
              vap,
            });
          });
        });
        toast.success(`Imported ${json.length} students from Excel`);
      } catch {
        toast.error("Failed to import students. Please upload a valid Excel (.xlsx) file.");
      } finally {
        if (fileRef.current) fileRef.current.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <PageHeader
        title="Students"
        description={canManageStudents
          ? "Manage learners in the selected curriculum. Click any field to edit."
          : "View-only. Only the Principal or Senior Teacher can add, edit, or remove learners."}
        actions={canManageStudents
          ? <Button onClick={addStudent}><Plus className="h-4 w-4 mr-1"/>Add student</Button>
          : <Badge variant="outline"><Lock className="h-3 w-3 mr-1"/>Read only</Badge>
        }
      />

      <div className="flex flex-wrap gap-2 mb-3">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground"/>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or admission no." className="pl-8 w-64"/>
        </div>
        <Select value={classFilter} onValueChange={(v) => { setClassFilter(v); setStreamFilter("all"); }}>
          <SelectTrigger className="w-48"><SelectValue/></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All classes</SelectItem>
            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={streamFilter} onValueChange={setStreamFilter} disabled={classFilter === "all"}>
          <SelectTrigger className="w-48"><SelectValue/></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All streams</SelectItem>
            {streams.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="ml-auto self-center">{students.length} students</Badge>
      </div>

      <Card className="overflow-x-auto card-pad">
        <table className="data-table">
          <thead>
            <tr>
              <th>Adm. No.</th><th>Name</th><th>Gender</th><th>Class</th><th>Stream</th><th>VAP</th>
              {canManageStudents && <th></th>}
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const streams = state.streams.filter(st => st.classId === s.classId);
              return (
                <tr key={s.id}>
                  <td>
                    <input className="inline-edit w-28" value={s.admissionNo} disabled={!canManageStudents}
                      onChange={(e) => update(st => { const x = st.students.find(x => x.id === s.id); if (x) x.admissionNo = e.target.value; })} />
                  </td>
                  <td>
                    <input className="inline-edit w-48 font-medium" value={s.name} disabled={!canManageStudents}
                      onChange={(e) => update(st => { const x = st.students.find(x => x.id === s.id); if (x) x.name = e.target.value; })} />
                  </td>
                  <td>
                    <select className="inline-edit" value={s.gender} disabled={!canManageStudents}
                      onChange={(e) => update(st => { const x = st.students.find(x => x.id === s.id); if (x) x.gender = e.target.value as "M" | "F"; })}>
                      <option value="M">M</option><option value="F">F</option>
                    </select>
                  </td>
                  <td>
                    <select className="inline-edit" value={s.classId} disabled={!canManageStudents}
                      onChange={(e) => update(st => {
                        const x = st.students.find(x => x.id === s.id);
                        if (x) { x.classId = e.target.value; x.streamId = st.streams.find(str => str.classId === e.target.value)?.id || x.streamId; }
                      })}>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </td>
                  <td>
                    <select className="inline-edit" value={s.streamId} disabled={!canManageStudents}
                      onChange={(e) => update(st => { const x = st.students.find(x => x.id === s.id); if (x) x.streamId = e.target.value; })}>
                      {streams.map(str => <option key={str.id} value={str.id}>{str.name}</option>)}
                    </select>
                  </td>
                  <td className="max-w-[280px]">
                    <input className="inline-edit w-full text-xs" value={s.vap} disabled={!canManageStudents}
                      onChange={(e) => update(st => { const x = st.students.find(x => x.id === s.id); if (x) x.vap = e.target.value; })} />
                  </td>
                  {canManageStudents && (
                    <td>
                      <Button size="icon" variant="ghost" onClick={() => removeStudent(s.id)}>
                        <Trash2 className="h-4 w-4 text-destructive"/>
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
            {students.length === 0 && (
              <tr><td colSpan={canManageStudents ? 7 : 6} className="text-center text-muted-foreground py-8">No students match filters</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
