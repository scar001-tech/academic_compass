import { useSchool } from "@/store/school";
import { useAuth } from "@/store/auth";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Lock, Download, Upload } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import type { Teacher } from "@/lib/schoolData";

export default function Teachers() {
  const { state, update } = useSchool();
  const { isPrincipal } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const add = () => {
    if (!isPrincipal) { toast.error("Only the Principal can manage the staff directory"); return; }
    update(s => {
      s.teachers.push({ id: `t_${Date.now()}`, name: "New Teacher", email: "new@school.ac.ke", role: "subject_teacher", curriculumIds: [] });
    });
  };

  const remove = (id: string) => {
    if (!isPrincipal) { toast.error("Only the Principal can manage the staff directory"); return; }
    update(s => { s.teachers = s.teachers.filter(x => x.id !== id); });
  };

  const exportTeachers = () => {
    const data = state.teachers.map(t => ({
      Name: t.name,
      Email: t.email,
      Role: t.role,
      Curricula: t.curriculumIds.join(", "),
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Teachers");
    XLSX.writeFile(workbook, `teachers-${new Date().toISOString().slice(0,10)}.xlsx`);
    toast.success("Teachers exported as Excel");
  };

  const importTeachers = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        update(s => {
          json.forEach((row) => {
            if (!row.Name || !row.Email) return;
            s.teachers.push({
              id: `t_${Date.now()}`,
              name: String(row.Name),
              email: String(row.Email),
              role: (["admin", "principal", "class_teacher", "subject_teacher"].includes(String(row.Role)) ? String(row.Role) : "subject_teacher") as Teacher["role"],
              curriculumIds: String(row.Curricula || "").split(",").map((c: string) => c.trim()).filter(Boolean) as Teacher["curriculumIds"],
            });
          });
        });
        toast.success(`Imported ${json.length} teachers from Excel`);
      } catch {
        toast.error("Failed to import teachers. Please upload a valid Excel (.xlsx) file.");
      } finally {
        if (fileRef.current) fileRef.current.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <PageHeader title="Teachers" description={isPrincipal
          ? "Manage staff and curriculum assignments."
          : "View-only. Only the Principal can edit the staff directory."}
        actions={isPrincipal
          ? <div className="flex gap-2">
              <Button variant="outline" onClick={exportTeachers} disabled={state.teachers.length === 0}>
                <Download className="h-4 w-4 mr-1"/>Export
              </Button>
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4 mr-1"/>Import
              </Button>
              <input ref={fileRef} type="file" accept=".xlsx,.csv" className="hidden" onChange={importTeachers} />
              <Button onClick={add}><Plus className="h-4 w-4 mr-1"/>Add teacher</Button>
            </div>
          : <Badge variant="outline"><Lock className="h-3 w-3 mr-1"/>Read only</Badge>} />
      <Card className="overflow-x-auto card-pad">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Curricula</th>{isPrincipal && <th></th>}</tr></thead>
          <tbody>
            {state.teachers.map(t => (
              <tr key={t.id}>
                <td><input className="inline-edit w-52 font-medium" value={t.name} disabled={!isPrincipal}
                  onChange={(e) => update(s => { const x = s.teachers.find(x => x.id === t.id); if (x) x.name = e.target.value; })}/></td>
                <td><input className="inline-edit w-56" value={t.email} disabled={!isPrincipal}
                  onChange={(e) => update(s => { const x = s.teachers.find(x => x.id === t.id); if (x) x.email = e.target.value; })}/></td>
                <td>
                  <select className="inline-edit" value={t.role} disabled={!isPrincipal}
                    onChange={(e) => update(s => { const x = s.teachers.find(x => x.id === t.id); if (x) x.role = e.target.value as Teacher["role"]; })}>
                    <option value="admin">Admin</option>
                    <option value="principal">Principal</option>
                    <option value="class_teacher">Class Teacher</option>
                    <option value="subject_teacher">Subject Teacher</option>
                  </select>
                </td>
                <td className="space-x-1">
                  {state.curricula.map(c => {
                    const active = t.curriculumIds.includes(c.id);
                    return (
                      <button key={c.id} disabled={!isPrincipal}
                        onClick={() => update(s => {
                          const x = s.teachers.find(x => x.id === t.id);
                          if (!x) return;
                          x.curriculumIds = active ? x.curriculumIds.filter(i => i !== c.id) : [...x.curriculumIds, c.id];
                        })}
                        className={`chip ${active ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground"} disabled:opacity-70 disabled:cursor-not-allowed`}>
                        {c.shortName}
                      </button>
                    );
                  })}
                </td>
                {isPrincipal && (
                  <td>
                    <Button variant="ghost" size="icon" onClick={() => remove(t.id)}>
                      <Trash2 className="h-4 w-4 text-destructive"/>
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
