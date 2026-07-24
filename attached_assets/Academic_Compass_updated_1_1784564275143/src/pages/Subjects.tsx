import { useSchool } from "@/store/school";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export default function Subjects() {
  const { state, activeCurriculum, update } = useSchool();
  const subjects = state.subjects.filter(s => s.curriculumId === activeCurriculum);
  const teachers = state.teachers.filter(t => t.curriculumIds.includes(activeCurriculum));

  const add = () => update(s => {
    s.subjects.push({ id: `sub_${Date.now()}`, curriculumId: activeCurriculum, name: "New Subject", code: "NEW" });
  });

  return (
    <div>
      <PageHeader title="Subjects" description="Manage subjects offered in this curriculum."
        actions={<Button onClick={add}><Plus className="h-4 w-4 mr-1"/>Add subject</Button>} />
      <Card className="overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>Code</th><th>Subject</th><th>Teacher</th><th></th></tr></thead>
          <tbody>
            {subjects.map((sub) => (
              <tr key={sub.id}>
                <td><input className="inline-edit w-16 font-mono" value={sub.code}
                  onChange={(e) => update(s => { const x = s.subjects.find(x => x.id === sub.id); if (x) x.code = e.target.value.toUpperCase(); })}/></td>
                <td><input className="inline-edit w-56 font-medium" value={sub.name}
                  onChange={(e) => update(s => { const x = s.subjects.find(x => x.id === sub.id); if (x) x.name = e.target.value; })}/></td>
                <td>
                  <select className="inline-edit" value={sub.teacherId || ""}
                    onChange={(e) => update(s => { const x = s.subjects.find(x => x.id === sub.id); if (x) x.teacherId = e.target.value || undefined; })}>
                    <option value="">Unassigned</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </td>
                <td>
                  <Button variant="ghost" size="icon" onClick={() => update(s => { s.subjects = s.subjects.filter(x => x.id !== sub.id); })}>
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
