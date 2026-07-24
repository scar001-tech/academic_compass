import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, UserSquare, ClipboardList,
  FileSpreadsheet, PencilLine, GitMerge, LineChart, Printer, Settings,
  Wifi, WifiOff, RefreshCw, School, User, LogOut, CalendarDays,
} from "lucide-react";
import { useSchool } from "@/store/school";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NAV = [
  { to: "/",           label: "Dashboard",       icon: LayoutDashboard, end: true },
  { to: "/students",   label: "Students",         icon: Users },
  { to: "/classes",    label: "Classes & Streams", icon: GraduationCap },
  { to: "/subjects",   label: "Subjects",         icon: BookOpen },
  { to: "/teachers",   label: "Teachers",         icon: UserSquare },
  { to: "/exams",      label: "Exams",            icon: ClipboardList },
  { to: "/sheets",     label: "Mark Sheets",      icon: FileSpreadsheet },
  { to: "/entry",      label: "Mark Entry",       icon: PencilLine },
  { to: "/timetable",  label: "Timetable",        icon: CalendarDays },
  { to: "/conflicts",  label: "Conflicts",        icon: GitMerge },
  { to: "/transcripts",label: "Transcripts",      icon: LineChart },
  { to: "/reports",    label: "Report Forms",     icon: Printer },
  { to: "/settings",   label: "Settings",         icon: Settings },
  { to: "/profile",    label: "My Profile",       icon: User },
];

const BOTTOM_NAV = [
  { to: "/",       label: "Home",     icon: LayoutDashboard, end: true },
  { to: "/entry",  label: "Entry",    icon: PencilLine },
  { to: "/sheets", label: "Sheets",   icon: FileSpreadsheet },
  { to: "/reports",label: "Reports",  icon: Printer },
  { to: "/students",label: "Students",icon: Users },
];

export default function AppShell() {
  const { state, activeCurriculum, setActiveCurriculum, syncNow } = useSchool();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const pending   = state.entries.filter(e => e.pending).length;
  const conflicts = state.conflicts.filter(c => c.status === "pending").length;

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border no-print">
        <div className="px-5 py-4 flex items-center gap-2 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded-md bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center">
            <School className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">Academic Compass</div>
            <div className="text-[11px] text-sidebar-foreground/70">Academic Ops</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          {NAV.map((n) => (
            <NavLink
              key={n.to} to={n.to} end={n.end}
              className={({ isActive }) => cn(
                "mx-2 my-0.5 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "hover:bg-sidebar-accent/60"
              )}
            >
              <n.icon className="h-4 w-4 opacity-90" />
              <span className="flex-1">{n.label}</span>
              {n.to === "/conflicts" && conflicts > 0 && (
                <span className="text-[10px] rounded-full bg-destructive text-destructive-foreground px-1.5 py-0.5 font-semibold">{conflicts}</span>
              )}
              {n.to === "/entry" && pending > 0 && (
                <span className="text-[10px] rounded-full bg-warning text-warning-foreground px-1.5 py-0.5 font-semibold">{pending}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-3 text-[11px] text-sidebar-foreground/60 border-t border-sidebar-border">
          v1.0 · {state.settings.schoolName}
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b no-print">
          <div className="px-4 lg:px-6 h-14 flex items-center gap-3">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center">
                <School className="h-4 w-4" />
              </div>
              <div className="text-sm font-semibold">Academic Compass</div>
            </div>

            {/* Curriculum selector */}
            <div className="ml-auto lg:ml-0 flex items-center gap-2">
              <Select value={activeCurriculum} onValueChange={(v) => setActiveCurriculum(v as "cbc" | "844")}>
                <SelectTrigger className="h-9 w-[190px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {state.curricula.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="inline-flex items-center gap-2">
                        <span className={cn(
                          "h-2 w-2 rounded-full",
                          c.id === "cbc" ? "bg-primary" : "bg-success"
                        )}/>
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto flex items-center gap-3">
              {/* Read-only network indicator */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-default select-none">
                    {state.online
                      ? <Wifi className="h-4 w-4 text-success"/>
                      : <WifiOff className="h-4 w-4 text-destructive"/>}
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {state.online ? "Online" : "Offline"}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {state.online ? "Connected to network" : "No network connection — changes will sync when reconnected"}
                </TooltipContent>
              </Tooltip>

              {pending > 0 && (
                <Badge variant="outline" className="border-warning text-warning-foreground bg-warning-soft hidden sm:inline-flex">
                  {pending} pending
                </Badge>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" onClick={syncNow} disabled={!state.online || pending === 0}>
                    <RefreshCw className="h-4 w-4 mr-1"/> Sync
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {state.lastSyncAt ? `Last sync ${new Date(state.lastSyncAt).toLocaleTimeString()}` : "Never synced"}
                </TooltipContent>
              </Tooltip>

              <div className="h-4 w-px bg-border mx-1 hidden md:block" />

              <span className="text-xs font-medium text-muted-foreground hidden md:inline">
                {user?.full_name || user?.email}
              </span>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/profile")}
                    className="h-9 w-9 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Profile</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      signOut();
                      toast.success("Signed out successfully.");
                    }}
                    className="h-9 w-9 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sign Out</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </header>

        <main key={location.pathname} className="flex-1 min-w-0 px-4 lg:px-6 py-5 pb-24 lg:pb-6 animate-fade-in">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-card border-t no-print">
          <div className="grid grid-cols-5">
            {BOTTOM_NAV.map((n) => (
              <NavLink
                key={n.to} to={n.to} end={n.end}
                className={({ isActive }) => cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 text-[11px]",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <n.icon className="h-5 w-5" />
                <span>{n.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
