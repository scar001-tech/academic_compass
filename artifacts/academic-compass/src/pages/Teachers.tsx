import { useSchool } from "@/store/school";
import { useAuth } from "@/store/auth";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Lock, Download, Upload, Shield } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { api } from "@/lib/api";
import type { Teacher } from "@/lib/schoolData";

interface BackendProfile {
  id: string;
  email: string;
  full_name: string | null;
  department: string | null;
  approved: boolean;
  created_at: string;
  roles: string[];
}

export default function Teachers() {
  const { state, update } = useSchool();
  const { isPrincipal } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [backendProfiles, setBackendProfiles] = useState<BackendProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  const fetchProfiles = async () => {
    if (!isPrincipal) return;
    setLoadingProfiles(true);
    try {
      const data = await api.get<BackendProfile[]>("/auth/profiles");
      setBackendProfiles(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load staff profiles.");
    } finally {
      setLoadingProfiles(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [isPrincipal]); // eslint-disable-line

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

  const handleApprovalToggle = async (userId: string, currentlyApproved: boolean) => {
    try {
      await api.post("/auth/set-approval", { userId, approved: !currentlyApproved });
      toast.success(!currentlyApproved ? "Staff member approved." : "Staff access revoked.");
      setBackendProfiles(prev => prev.map(p => p.id === userId ? { ...p, approved: !currentlyApproved } : p));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update approval status.";
      toast.error(msg);
    }
  };

  const handleRoleToggle = async (userId: string, targetRole: "teacher" | "senior_teacher", hasRole: boolean) => {
    const action = hasRole ? "remove" : "add";
    try {
      await api.post("/auth/assign-role", { userId, role: targetRole, action });
      toast.success("Role assignment updated successfully.");
      setBackendProfiles(prev => prev.map(p => {
        if (p.id !== userId) return p;
        return { ...p, roles: action === "add" ? [...p.roles, targetRole] : p.roles.filter(r => r !== targetRole) };
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update role assignment.";
      toast.error(msg);
    }
  };

  return (
    <div>
      <PageHeader title="Teachers" description={isPrincipal
          ? "Manage staff directory, assignments, and registered accounts."
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

      {isPrincipal && (
        <Card className="p-4 md:p-6 mb-4 space-y-4 md:space-y-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold">Registered Staff — Approval &amp; Role Assignment</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            View all staff who have registered accounts. Approve access and assign Teacher or Senior Teacher roles.
          </p>
          <div className="overflow-x-auto border border-border rounded-lg min-w-[640px]">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground text-xs uppercase font-medium border-b border-border">
                <tr>
                  <th className="px-3 md:px-6 py-3">Full Name</th>
                  <th className="px-3 md:px-6 py-3">Email</th>
                  <th className="px-3 md:px-6 py-3">Department</th>
                  <th className="px-3 md:px-6 py-3 text-center">Approved</th>
                  <th className="px-3 md:px-6 py-3 text-center">Teacher</th>
                  <th className="px-3 md:px-6 py-3 text-center">Senior Teacher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loadingProfiles ? (
                  <tr><td colSpan={6} className="px-4 md:px-6 py-10 text-center text-muted-foreground">Loading registered staff...</td></tr>
                ) : backendProfiles.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 md:px-6 py-10 text-center text-muted-foreground">No registered staff yet.</td></tr>
                ) : backendProfiles.map((p) => {
                  const hasTeacher = p.roles.includes("teacher");
                  const hasSeniorTeacher = p.roles.includes("senior_teacher");
                  const isPrincipalRow = p.roles.includes("admin") || p.roles.includes("principal");
                  return (
                    <tr key={p.id} className="hover:bg-muted/30 transition">
                      <td className="px-3 md:px-6 py-3 md:py-4 font-medium">{p.full_name || "Unnamed"}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-muted-foreground">{p.email}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-muted-foreground">{p.department || "—"}</td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                        {isPrincipalRow ? (
                          <span className="text-xs text-muted-foreground italic">Principal</span>
                        ) : (
                          <div className="flex justify-center items-center gap-2">
                            <span className={`text-xs ${p.approved ? "text-success font-semibold" : "text-warning-foreground"}`}>
                              {p.approved ? "Approved" : "Pending"}
                            </span>
                            <Switch checked={p.approved} onCheckedChange={() => handleApprovalToggle(p.id, p.approved)} />
                          </div>
                        )}
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <span className={`text-xs ${hasTeacher ? "text-green-600 font-semibold" : "text-muted-foreground"}`}>{hasTeacher ? "Yes" : "No"}</span>
                          <Switch checked={hasTeacher} onCheckedChange={() => handleRoleToggle(p.id, "teacher", hasTeacher)} disabled={isPrincipalRow} />
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <span className={`text-xs ${hasSeniorTeacher ? "text-purple-600 font-semibold" : "text-muted-foreground"}`}>{hasSeniorTeacher ? "Yes" : "No"}</span>
                          <Switch checked={hasSeniorTeacher} onCheckedChange={() => handleRoleToggle(p.id, "senior_teacher", hasSeniorTeacher)} disabled={isPrincipalRow} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

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
