import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

export type AppRole = "admin" | "principal" | "hod" | "class_teacher" | "subject_teacher" | "teacher" | "senior_teacher";

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string | null;
  department?: string | null;
  approved?: boolean;
}

/** Minimal session-like object so ProtectedRoute can check `session` */
interface Session {
  user: AuthUser;
  token: string;
}

interface AuthCtx {
  session: Session | null;
  user: AuthUser | null;
  roles: AppRole[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, full_name?: string, department?: string) => Promise<void>;
  signOut: () => void;
  hasRole: (...r: AppRole[]) => boolean;
  refreshRoles: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  canEditTimetable: boolean;
  isTeacher: boolean;
  isSeniorTeacher: boolean;
  /** Principal / overall admin — full access to every part of the site. */
  isPrincipal: boolean;
  /** Approved staff (any role) can enter marks, comment on report forms, and view the timetable. */
  isApproved: boolean;
  /** Only the Principal can approve staff and assign Teacher / Senior Teacher roles. */
  canManageStaff: boolean;
  /** Principal + Senior Teacher can add/remove learners; plain Teachers cannot. */
  canManageStudents: boolean;
}

const Ctx = createContext<AuthCtx | null>(null);

const TOKEN_KEY = "ac_token";
const USER_KEY  = "ac_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const user  = JSON.parse(localStorage.getItem(USER_KEY) || "null");
      if (token && user) return { token, user };
    } catch (_e) {
      // invalid stored data — start fresh
    }
    return null;
  });
  const [roles, setRoles]     = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const storeSession = (token: string, user: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setSession({ token, user });
  };

  const updateStoredUser = (patch: Partial<AuthUser>) => {
    setSession((prev) => {
      if (!prev) return prev;
      const nextUser = { ...prev.user, ...patch };
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      return { ...prev, user: nextUser };
    });
  };

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setSession(null);
    setRoles([]);
  };

  // Fetch roles whenever the token changes
  useEffect(() => {
    if (!session) { setLoading(false); return; }
    api.get<AppRole[]>("/auth/roles")
      .then(setRoles)
      .catch(() => setRoles([]))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token, user } = await api.post<{ token: string; user: AuthUser }>(
      "/auth/signin", { email, password }
    );
    storeSession(token, user);
  }, []);

  const signUp = useCallback(async (email: string, password: string, full_name?: string, department?: string) => {
    const { token, user } = await api.post<{ token: string; user: AuthUser }>(
      "/auth/signup", { email, password, full_name, department }
    );
    storeSession(token, user);
  }, []);

  const signOut = useCallback(() => clearSession(), []);

  const hasRole = useCallback((...r: AppRole[]) => r.some(x => roles.includes(x)), [roles]);
  
  const refreshRoles = useCallback(async () => {
    if (!session) return;
    try {
      const updatedRoles = await api.get<AppRole[]>("/auth/roles");
      setRoles(updatedRoles);
    } catch (_e) {
      // ignore
    }
  }, [session]);

  /** Re-fetch department + approval status (e.g. after the Principal approves this user). */
  const refreshProfile = useCallback(async () => {
    if (!session) return;
    try {
      const me = await api.get<{ department: string | null; approved: boolean; full_name: string | null }>("/auth/me");
      updateStoredUser({ department: me.department, approved: me.approved, full_name: me.full_name });
    } catch (_e) {
      // ignore
    }
  }, [session]);

  const isPrincipal = hasRole("admin", "principal");
  const canEditTimetable = isPrincipal || hasRole("senior_teacher");
  const isTeacher = hasRole("teacher");
  const isSeniorTeacher = hasRole("senior_teacher");
  const isApproved = isPrincipal || !!session?.user?.approved;
  const canManageStaff = isPrincipal;
  const canManageStudents = isPrincipal || hasRole("senior_teacher");

  return (
    <Ctx.Provider value={{
      session, user: session?.user ?? null, roles, loading,
      signIn, signUp, signOut, hasRole, refreshRoles, refreshProfile, canEditTimetable,
      isTeacher, isSeniorTeacher, isPrincipal, isApproved, canManageStaff, canManageStudents,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside AuthProvider");
  return c;
}
