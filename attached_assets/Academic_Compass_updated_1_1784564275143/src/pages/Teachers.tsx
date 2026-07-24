import { useSchool } from "@/store/school";
import { useAuth } from "@/store/auth";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Lock } from "lucide-react";
import { toast } from "sonner";
import type { Teacher } from "@/lib/schoolData";

export default function Teachers() {
  const { state, update } = useSchool();
  const { isPrincipal } = useAuth();

  const add = () => {
    if (!isPrincipal) return toast.error("Only the Principal can manage the staff directory");
    update(s => {
      s.teachers.push({
        id: `t_${Date.now()}`, name: "New Teacher", email: "new@school.ac.ke",
        role: "subject_teacher", curriculumIds: [],
      });
    });
  };

  const remove = (id: string) => {
    if (!isPrincipal) return toast.error("Only the Principal can manage the staff directory");
    update(s => { s.teachers = s.teachers.filter(x => x.id !== id); });
  };

  return (
    <div>
      <PageHeader title="Teachers" description={isPrincipal
          ? "Manage staff and curriculum assignments."
          : "View-only. Only the Principal can edit the staff directory."}
        actions={isPrincipal
          ? <Button onClick={add}><Plus className="h-4 w-4 mr-1"/>Add teacher</Button>
          : <Badge variant="outline"><Lock className="h-3 w-3 mr-1"/>Read only</Badge>} />
      <Card className="overflow-x-auto">
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
