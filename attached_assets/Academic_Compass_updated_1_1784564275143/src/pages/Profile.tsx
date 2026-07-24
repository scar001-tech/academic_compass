import { useEffect, useState } from "react";
import { useAuth } from "@/store/auth";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  User as UserIcon,
  Shield,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  Crown,
  Users,
  Clock,
  Briefcase,
} from "lucide-react";

interface ProfileItem {
  id: string;
  email: string;
  full_name: string | null;
  department: string | null;
  approved: boolean;
  created_at: string;
  roles: string[];
}

export default function Profile() {
  const { user, roles, isTeacher, isSeniorTeacher, isPrincipal, canManageStaff, refreshRoles } = useAuth();
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  // Only the Principal (overall admin) manages staff approval and roles.
  const isAuthenticator = canManageStaff;

  const fetchProfiles = async () => {
    if (!isAuthenticator) return;
    setLoadingProfiles(true);
    try {
      const data = await api.get<ProfileItem[]>("/auth/profiles");
      setProfiles(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load user profiles.");
    } finally {
      setLoadingProfiles(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [roles]);

  const handleApprovalToggle = async (userId: string, currentlyApproved: boolean) => {
    try {
      await api.post("/auth/set-approval", { userId, approved: !currentlyApproved });
      toast.success(!currentlyApproved ? "Staff member approved." : "Staff access revoked.");
      setProfiles((prev) => prev.map((p) => p.id === userId ? { ...p, approved: !currentlyApproved } : p));
    } catch (err: any) {
      toast.error(err?.message || "Failed to update approval status.");
    }
  };

  const handleRoleToggle = async (userId: string, targetRole: "teacher" | "senior_teacher", hasRole: boolean) => {
    const action = hasRole ? "remove" : "add";
    try {
      await api.post("/auth/assign-role", { userId, role: targetRole, action });
      toast.success(`Role assignment updated successfully.`);
      
      // Update local profiles list state
      setProfiles((prev) =>
        prev.map((p) => {
          if (p.id === userId) {
            const updatedRoles = action === "add" 
              ? [...p.roles, targetRole]
              : p.roles.filter((r) => r !== targetRole);
            return { ...p, roles: updatedRoles };
          }
          return p;
        })
      );

      // If the admin modified their own role, refresh the auth context roles
      if (userId === user?.id) {
        await refreshRoles();
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to update role assignment.";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="View your profile details and role assignments."
      />

      <div className="grid md:grid-cols-3 gap-6">
        {/* User Card */}
        <Card className="p-6 flex flex-col items-center justify-center text-center space-y-4 md:col-span-1">
          <div className="h-24 w-24 rounded-full bg-primary/10 text-primary grid place-items-center mb-2">
            <UserIcon className="h-12 w-12" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.full_name || "School Member"}</h2>
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
              <Mail className="h-3 w-3" /> {user?.email}
            </p>
          </div>
          
          <div className="w-full pt-4 border-t border-border space-y-2 text-left">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Registered</span>
              <span className="font-medium text-foreground">
                {user?.id ? "Active Account" : "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> Department</span>
              <span className="font-medium text-foreground">
                {user?.department || "—"}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> System Roles</span>
              <span className="font-semibold text-primary capitalize">
                {roles.length > 0 ? roles.join(", ") : "no roles"}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Access Status</span>
              {isPrincipal || user?.approved ? (
                <span className="font-semibold text-success flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Approved</span>
              ) : (
                <span className="font-semibold text-warning-foreground flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Pending</span>
              )}
            </div>
          </div>
        </Card>

        {/* Roles Details Card */}
        <Card className="p-6 md:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Authenticator Status</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Verify if the overall school authenticator has assigned your profile as a Teacher or a Senior Teacher.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Teacher Assignment */}
            <div className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 ${
              isTeacher 
                ? "bg-green-50/50 border-green-200 dark:bg-green-950/10 dark:border-green-900" 
                : "bg-muted/50 border-border"
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-base">Teacher Assignment</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Allows you to view student lists, enter marks, and add assessment comments.
                  </p>
                </div>
                <div className={`h-8 w-8 rounded-full grid place-items-center ${
                  isTeacher ? "bg-green-100 text-green-600 dark:bg-green-900/30" : "bg-muted text-muted-foreground"
                }`}>
                  <Users className="h-4 w-4" />
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm font-medium">
                {isTeacher ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 dark:text-green-400">Assigned as Teacher</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">Not Assigned</span>
                  </>
                )}
              </div>
            </div>

            {/* Senior Teacher Assignment */}
            <div className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 ${
              isSeniorTeacher 
                ? "bg-purple-50/50 border-purple-200 dark:bg-purple-950/10 dark:border-purple-900" 
                : "bg-muted/50 border-border"
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-base">Senior Teacher Assignment</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Allows you to manage timetables, schedule classes, and assign teacher duties.
                  </p>
                </div>
                <div className={`h-8 w-8 rounded-full grid place-items-center ${
                  isSeniorTeacher ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30" : "bg-muted text-muted-foreground"
                }`}>
                  <Crown className="h-4 w-4" />
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm font-medium">
                {isSeniorTeacher ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-purple-600" />
                    <span className="text-purple-800 dark:text-purple-400 font-semibold">Assigned as Senior Teacher</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">Not Assigned</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground pt-4 border-t border-border">
            * Assignments are managed securely by the principal and platform administrators. If your status is incorrect, please contact your administrator.
          </div>
        </Card>
      </div>

      {/* Authenticator Admin Panel */}
      {isAuthenticator && (
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary animate-pulse" />
              Principal — Staff Approval &amp; Role Assignment Panel
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              As the Principal (overall admin), you approve new sign-ups and assign or remove
              Teacher and Senior Teacher roles for all registered profiles. Department is shown
              to help you review each request.
            </p>
          </div>

          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground text-xs uppercase font-medium border-b border-border">
                <tr>
                  <th className="px-6 py-3">Full Name</th>
                  <th className="px-6 py-3">Email Address</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3 text-center">Approved</th>
                  <th className="px-6 py-3 text-center">Teacher Role</th>
                  <th className="px-6 py-3 text-center">Senior Teacher Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loadingProfiles ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                      Loading registered staff profiles...
                    </td>
                  </tr>
                ) : profiles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                      No staff profiles registered.
                    </td>
                  </tr>
                ) : (
                  profiles.map((p) => {
                    const hasTeacher = p.roles.includes("teacher");
                    const hasSeniorTeacher = p.roles.includes("senior_teacher");
                    const isPrincipalRow = p.roles.includes("admin") || p.roles.includes("principal");
                    
                    return (
                      <tr key={p.id} className="hover:bg-muted/30 transition">
                        <td className="px-6 py-4 font-medium">{p.full_name || "Unnamed"}</td>
                        <td className="px-6 py-4 text-muted-foreground">{p.email}</td>
                        <td className="px-6 py-4 text-muted-foreground">{p.department || "—"}</td>
                        <td className="px-6 py-4 text-center">
                          {isPrincipalRow ? (
                            <span className="text-xs text-muted-foreground italic">Principal</span>
                          ) : (
                            <div className="flex justify-center items-center gap-2">
                              <span className={`text-xs ${p.approved ? "text-success font-semibold" : "text-warning-foreground"}`}>
                                {p.approved ? "Approved" : "Pending"}
                              </span>
                              <Switch
                                checked={p.approved}
                                onCheckedChange={() => handleApprovalToggle(p.id, p.approved)}
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center items-center gap-2">
                            <span className={`text-xs ${hasTeacher ? "text-green-600 font-semibold" : "text-muted-foreground"}`}>
                              {hasTeacher ? "Yes" : "No"}
                            </span>
                            <Switch
                              checked={hasTeacher}
                              onCheckedChange={() => handleRoleToggle(p.id, "teacher", hasTeacher)}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center items-center gap-2">
                            <span className={`text-xs ${hasSeniorTeacher ? "text-purple-600 font-semibold" : "text-muted-foreground"}`}>
                              {hasSeniorTeacher ? "Yes" : "No"}
                            </span>
                            <Switch
                              checked={hasSeniorTeacher}
                              onCheckedChange={() => handleRoleToggle(p.id, "senior_teacher", hasSeniorTeacher)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
