import { useSchool } from "@/store/school";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Download, Upload } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

export default function Exams() {
  const { state, activeCurriculum, update } = useSchool();
  const exams = state.exams.filter(e => e.curriculumId === activeCurriculum);
  const fileRef = useRef<HTMLInputElement>(null);

  const add = () => update(s => {
    s.exams.push({
      id: `ex_${Date.now()}`, curriculumId: activeCurriculum, name: "New Exam",
      term: 1, year: s.settings.academicYear, outOf: 100, status: "draft",
    });
  });

  const exportExams = () => {
    const data = JSON.stringify(exams, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exams-${activeCurriculum}-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exams exported successfully");
  };

  const importExams = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(imported)) throw new Error("Invalid format");
        update(s => {
          imported.forEach((ex: any) => {
            if (!ex.id || !ex.name || !ex.term || !ex.year) return;
            s.exams.push({
              id: ex.id || `ex_${Date.now()}`,
              curriculumId: activeCurriculum,
              name: ex.name,
              term: ex.term,
              year: ex.year,
              outOf: ex.outOf || 100,
              status: ex.status || "draft",
            });
          });
        });
        toast.success(`Imported ${imported.length} exams`);
      } catch {
        toast.error("Failed to import exams. Invalid JSON format.");
      } finally {
        if (fileRef.current) fileRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <PageHeader title="Exams" description="Set up exams and terms for this curriculum."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportExams} disabled={exams.length === 0}>
              <Download className="h-4 w-4 mr-1"/>Export
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4 mr-1"/>Import
            </Button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={importExams} />
            <Button onClick={add}><Plus className="h-4 w-4 mr-1"/>Add exam</Button>
          </div>
        }/>
      <Card className="overflow-x-auto card-pad">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Term</th><th>Year</th><th>Out of</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {exams.map(ex => (
              <tr key={ex.id}>
                <td><input className="inline-edit w-40 font-medium" value={ex.name}
                  onChange={(e) => update(s => { const x = s.exams.find(x => x.id === ex.id); if (x) x.name = e.target.value; })}/></td>
                <td>
                  <select className="inline-edit" value={ex.term}
                    onChange={(e) => update(s => { const x = s.exams.find(x => x.id === ex.id); if (x) x.term = Number(e.target.value) as 1|2|3; })}>
                    <option value={1}>1</option><option value={2}>2</option><option value={3}>3</option>
                  </select>
                </td>
                <td><input type="number" className="inline-edit w-20" value={ex.year}
                  onChange={(e) => update(s => { const x = s.exams.find(x => x.id === ex.id); if (x) x.year = Number(e.target.value); })}/></td>
                <td><input type="number" className="inline-edit w-16" value={ex.outOf}
                  onChange={(e) => update(s => { const x = s.exams.find(x => x.id === ex.id); if (x) x.outOf = Number(e.target.value); })}/></td>
                <td>
                  <select className="inline-edit" value={ex.status}
                    onChange={(e) => update(s => { const x = s.exams.find(x => x.id === ex.id); if (x) x.status = e.target.value as "draft"|"open"|"closed"; })}>
                    <option value="draft">Draft</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
                <td>
                  <Button variant="ghost" size="icon" onClick={() => update(s => { s.exams = s.exams.filter(x => x.id !== ex.id); })}>
                    <Trash2 className="h-4 w-4 text-destructive"/>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
