/**
 * REST sync layer for mark entries and timetable slots.
 * Offline-first: local store is authoritative for reads; writes push to /api/*.
 */
import { api } from "./api";

export interface RemoteMarkEntry {
  id: string;
  curriculum_id: string;
  sheet_id: string;
  student_id: string;
  score: number | null;
  updated_by: string | null;
  device_name: string | null;
  version: number;
  updated_at: string;
}

export interface RemoteTimetableSlot {
  id: string;
  curriculum_id: string;
  class_id: string;
  stream_id: string | null;
  day_of_week: number;
  period: number;
  start_time: string | null;
  end_time: string | null;
  subject_id: string | null;
  teacher_id: string | null;
  room: string | null;
  version: number;
  updated_by: string | null;
  device_name: string | null;
  updated_at: string;
}

export interface RemoteConflict {
  id: string;
  entity: string;
  entity_id: string;
  field: string;
  server_value: string | null;
  incoming_value: string | null;
  incoming_by: string | null;
  incoming_device: string | null;
  status: "pending" | "resolved";
  resolution: string | null;
  custom_value: string | null;
  created_at: string;
}

export async function pushMarkEntry(local: {
  id: string;
  curriculumId: string;
  sheetId: string;
  studentId: string;
  score: number | null;
  version: number;
  deviceName: string;
}): Promise<"ok" | "conflict" | "error"> {
  try {
    const result = await api.post<{ status: string }>("/mark-entries", {
      id: local.id,
      curriculum_id: local.curriculumId,
      sheet_id: local.sheetId,
      student_id: local.studentId,
      score: local.score,
      version: local.version,
      device_name: local.deviceName,
    });
    return result.status as "ok" | "conflict" | "error";
  } catch {
    return "error";
  }
}

export async function fetchAllMarkEntries(): Promise<RemoteMarkEntry[]> {
  try {
    return await api.get<RemoteMarkEntry[]>("/mark-entries");
  } catch {
    return [];
  }
}

export async function fetchAllTimetableSlots(): Promise<RemoteTimetableSlot[]> {
  try {
    return await api.get<RemoteTimetableSlot[]>("/timetable-slots");
  } catch {
    return [];
  }
}

export async function fetchPendingConflicts(): Promise<RemoteConflict[]> {
  try {
    return await api.get<RemoteConflict[]>("/conflicts?status=pending");
  } catch {
    return [];
  }
}

export async function resolveRemoteConflict(
  id: string,
  resolution: "server" | "this" | "custom",
  customValue?: string
) {
  try {
    await api.patch(`/conflicts/${encodeURIComponent(id)}`, {
      resolution,
      custom_value: customValue ?? null,
    });
  } catch (err) {
    console.error("[resolveRemoteConflict]", err);
  }
}

export async function pushTimetableSlot(
  local: RemoteTimetableSlot & { _isNew?: boolean }
): Promise<"ok" | "conflict" | "error" | "forbidden"> {
  try {
    const result = await api.post<{ status: string }>("/timetable-slots", local);
    return result.status as "ok" | "conflict" | "error" | "forbidden";
  } catch {
    return "error";
  }
}

export async function deleteTimetableSlot(id: string) {
  try {
    await api.delete(`/timetable-slots/${encodeURIComponent(id)}`);
  } catch (err) {
    console.error("[deleteTimetableSlot]", err);
  }
}
