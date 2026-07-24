import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  AppState, CurriculumId, ID, SyncConflict, TimetableSlot,
  loadState, saveState, resetState,
} from "@/lib/schoolData";
import {
  pushMarkEntry, fetchAllMarkEntries, fetchAllTimetableSlots,
  fetchPendingConflicts, resolveRemoteConflict,
  pushTimetableSlot, deleteTimetableSlot,
  RemoteTimetableSlot,
} from "@/lib/syncService";
import { toast } from "sonner";

interface SchoolCtx {
  state: AppState;
  activeCurriculum: CurriculumId;
  setActiveCurriculum: (c: CurriculumId) => void;
  update: (updater: (s: AppState) => void) => void;
  setOnline: (v: boolean) => void;
  syncNow: () => Promise<void>;
  syncing: boolean;
  resetAll: () => void;
  setMarkScore: (entryId: ID, score: number | null) => void;
  resolveConflict: (id: ID, resolution: SyncConflict["resolution"], custom?: string) => Promise<void>;
  bulkResolveConflicts: (resolution: SyncConflict["resolution"]) => Promise<void>;
  upsertTimetableSlot: (slot: TimetableSlot) => void;
  removeTimetableSlot: (id: ID) => void;
}

const Ctx = createContext<SchoolCtx | null>(null);

export function SchoolProvider({ children }: { children: React.ReactNode }) {
  const [state, setState]   = useState<AppState>(() => loadState());
  const [syncing, setSyncing] = useState(false);
  const [activeCurriculum, setActiveCurriculum] = useState<CurriculumId>(() => {
    return (localStorage.getItem("scholaris_active") as CurriculumId) || "cbc";
  });
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => { saveState(state); }, [state]);
  useEffect(() => { localStorage.setItem("scholaris_active", activeCurriculum); }, [activeCurriculum]);

  const update = useCallback((updater: (s: AppState) => void) => {
    setState((prev) => {
      const next: AppState = structuredClone(prev);
      updater(next);
      return next;
    });
  }, []);

  // Track network connectivity
  useEffect(() => {
    const on  = () => update((s) => { s.online = true; });
    const off = () => update((s) => { s.online = false; });
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    update((s) => { s.online = navigator.onLine; });
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, [update]);

  const setOnline = useCallback((v: boolean) => {
    update((s) => { s.online = v; });
  }, [update]);

  // --------- REST sync ---------
  const syncNow = useCallback(async () => {
    if (syncing) return;
    // Only sync when a token is present (user is signed in)
    if (!localStorage.getItem("ac_token")) return;
    setSyncing(true);
    try {
      const s = stateRef.current;

      // 1) Push pending mark entries
      const pending = s.entries.filter(e => e.pending);
      let pushed = 0, conflicted = 0;
      for (const e of pending) {
        const res = await pushMarkEntry({
          id: e.id,
          curriculumId: s.sheets.find(sh => sh.id === e.sheetId)?.curriculumId ?? "cbc",
          sheetId: e.sheetId,
          studentId: e.studentId,
          score: e.score,
          version: e.version ?? 1,
          deviceName: s.deviceName,
        });
        if (res === "ok") pushed++;
        else if (res === "conflict") conflicted++;
      }

      // 2) Push pending timetable slots
      const pendingSlots = (s.timetable ?? []).filter(sl => sl.pending);
      for (const sl of pendingSlots) {
        await pushTimetableSlot({
          id: sl.id,
          curriculum_id: sl.curriculumId,
          class_id: sl.classId,
          stream_id: sl.streamId ?? null,
          day_of_week: sl.dayOfWeek,
          period: sl.period,
          start_time: sl.startTime ?? null,
          end_time: sl.endTime ?? null,
          subject_id: sl.subjectId ?? null,
          teacher_id: sl.teacherId ?? null,
          room: sl.room ?? null,
          version: sl.version ?? 1,
          updated_by: null,
          device_name: s.deviceName,
          updated_at: new Date().toISOString(),
        });
      }

      // 3) Pull latest from server
      const [remoteEntries, remoteSlots, remoteConflicts] = await Promise.all([
        fetchAllMarkEntries(),
        fetchAllTimetableSlots(),
        fetchPendingConflicts(),
      ]);

      update((n) => {
        // Merge marks
        const localById = new Map(n.entries.map(e => [e.id, e]));
        for (const r of remoteEntries) {
          const l = localById.get(r.id);
          if (!l) continue;
          if (l.pending) continue;
          l.score = r.score;
          l.version = r.version;
          l.updatedAt = new Date(r.updated_at).getTime();
          l.updatedBy = r.device_name ?? "Cloud";
        }
        for (const e of n.entries) {
          if (e.pending) {
            const remote = remoteEntries.find(r => r.id === e.id);
            if (remote) {
              e.version = remote.version;
              e.pending = false;
            }
          }
        }

        // Timetable merge
        n.timetable = (remoteSlots as RemoteTimetableSlot[]).map(r => ({
          id: r.id,
          curriculumId: r.curriculum_id as CurriculumId,
          classId: r.class_id,
          streamId: r.stream_id ?? undefined,
          dayOfWeek: r.day_of_week,
          period: r.period,
          startTime: r.start_time ?? undefined,
          endTime: r.end_time ?? undefined,
          subjectId: r.subject_id ?? undefined,
          teacherId: r.teacher_id ?? undefined,
          room: r.room ?? undefined,
          version: r.version,
          updatedAt: new Date(r.updated_at).getTime(),
          updatedBy: r.device_name ?? "Cloud",
          pending: false,
        }));
        // Keep still-pending local slots
        const remoteIds = new Set(n.timetable.map(t => t.id));
        (stateRef.current.timetable ?? []).forEach(local => {
          if (local.pending && !remoteIds.has(local.id)) n.timetable.push(local);
        });

        // Conflicts merge
        n.conflicts = remoteConflicts
          .filter(c => c.status === "pending")
          .map(c => ({
            id: c.id,
            entity: c.entity as SyncConflict["entity"],
            field: c.field,
            serverValue: c.server_value ?? "",
            thisDeviceValue: c.incoming_value ?? "",
            editedBy: c.incoming_by ?? "unknown",
            deviceName: c.incoming_device ?? "device",
            timestamp: new Date(c.created_at).getTime(),
            status: "pending" as const,
            ...(c.entity === "mark" ? decodeMarkEntity(n, c.entity_id) : {}),
            ...(c.entity === "timetable" ? { timetableSlotId: c.entity_id } : {}),
          }));

        n.syncQueue = n.entries.filter(e => e.pending).map(e => e.id);
        n.lastSyncAt = Date.now();
      });

      if (pushed)     toast.success(`Synced ${pushed} change${pushed > 1 ? "s" : ""}`);
      if (conflicted) toast.warning(`${conflicted} conflict${conflicted > 1 ? "s" : ""} to resolve`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Sync failed: " + msg);
    } finally {
      setSyncing(false);
    }
  }, [update, syncing]);

  // Auto-sync when online and pending changes exist
  useEffect(() => {
    if (state.online) {
      const hasPending =
        state.entries.some(e => e.pending) ||
        (state.timetable ?? []).some(t => t.pending);
      if (hasPending) syncNow();
    }
  }, [state.online]); // eslint-disable-line

  // Initial pull on mount (if token available)
  useEffect(() => {
    if (localStorage.getItem("ac_token")) {
      syncNow();
    }
  }, []); // eslint-disable-line

  const setMarkScore = useCallback((entryId: ID, score: number | null) => {
    update((s) => {
      const e = s.entries.find(x => x.id === entryId);
      if (!e) return;
      e.score = score;
      e.updatedAt = Date.now();
      e.updatedBy = s.deviceName;
      e.pending = true;
      if (!s.syncQueue.includes(entryId)) s.syncQueue.push(entryId);
    });
    if (stateRef.current.online) syncNow();
  }, [update, syncNow]);

  const resolveConflict = useCallback(async (
    id: ID,
    resolution: SyncConflict["resolution"],
    custom?: string
  ) => {
    await resolveRemoteConflict(
      id,
      (resolution as any) === "other" ? "this" : (resolution as any),
      custom
    );
    update((s) => {
      const c = s.conflicts.find(x => x.id === id);
      if (c) {
        c.status = "resolved";
        c.resolution = resolution;
        if (resolution === "custom") c.customValue = custom;
      }
    });
    syncNow();
  }, [update, syncNow]);

  const bulkResolveConflicts = useCallback(async (resolution: SyncConflict["resolution"]) => {
    const pending = stateRef.current.conflicts.filter(c => c.status === "pending");
    for (const c of pending) {
      await resolveRemoteConflict(c.id, resolution as any);
    }
    update((s) => {
      s.conflicts.forEach(c => {
        if (c.status === "pending") { c.status = "resolved"; c.resolution = resolution; }
      });
    });
    syncNow();
  }, [update, syncNow]);

  const upsertTimetableSlot = useCallback((slot: TimetableSlot) => {
    update((s) => {
      s.timetable = s.timetable ?? [];
      const i = s.timetable.findIndex(t => t.id === slot.id);
      const next = { ...slot, updatedAt: Date.now(), updatedBy: s.deviceName, pending: true };
      if (i >= 0) s.timetable[i] = { ...s.timetable[i], ...next };
      else s.timetable.push(next);
    });
    if (stateRef.current.online) syncNow();
  }, [update, syncNow]);

  const removeTimetableSlot = useCallback(async (id: ID) => {
    await deleteTimetableSlot(id);
    update((s) => { s.timetable = (s.timetable ?? []).filter(t => t.id !== id); });
  }, [update]);

  const resetAll = useCallback(() => { setState(resetState()); }, []);

  const value = useMemo<SchoolCtx>(() => ({
    state, activeCurriculum, setActiveCurriculum, update, setOnline,
    syncNow, syncing, setMarkScore, resolveConflict, bulkResolveConflicts,
    resetAll, upsertTimetableSlot, removeTimetableSlot,
  }), [
    state, activeCurriculum, update, setOnline, syncNow, syncing,
    setMarkScore, resolveConflict, bulkResolveConflicts, resetAll,
    upsertTimetableSlot, removeTimetableSlot,
  ]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function decodeMarkEntity(state: AppState, entryId: ID) {
  const e = state.entries.find(x => x.id === entryId);
  if (!e) return {};
  const sheet = state.sheets.find(sh => sh.id === e.sheetId);
  return { studentId: e.studentId, subjectId: sheet?.subjectId, examId: sheet?.examId, markEntryId: entryId };
}

export function useSchool() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSchool must be used within SchoolProvider");
  return ctx;
}
