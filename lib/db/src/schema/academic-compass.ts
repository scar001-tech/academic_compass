import { pgTable, text, boolean, integer, real, timestamp, primaryKey } from "drizzle-orm/pg-core";

export const profiles = pgTable("ac_profiles", {
  id:           text("id").primaryKey().notNull(),
  email:        text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName:     text("full_name"),
  department:   text("department"),
  approved:     boolean("approved").default(false).notNull(),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
});

export const userRoles = pgTable("ac_user_roles", {
  userId: text("user_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  role:   text("role").notNull(),
}, (t) => [primaryKey({ columns: [t.userId, t.role] })]);

export const markEntries = pgTable("ac_mark_entries", {
  id:           text("id").primaryKey().notNull(),
  curriculumId: text("curriculum_id").notNull(),
  sheetId:      text("sheet_id").notNull(),
  studentId:    text("student_id").notNull(),
  score:        real("score"),
  updatedBy:    text("updated_by"),
  deviceName:   text("device_name"),
  version:      integer("version").default(1).notNull(),
  updatedAt:    timestamp("updated_at").defaultNow().notNull(),
});

export const timetableSlots = pgTable("ac_timetable_slots", {
  id:           text("id").primaryKey().notNull(),
  curriculumId: text("curriculum_id").notNull(),
  classId:      text("class_id").notNull(),
  streamId:     text("stream_id"),
  dayOfWeek:    integer("day_of_week").notNull(),
  period:       integer("period").notNull(),
  startTime:    text("start_time"),
  endTime:      text("end_time"),
  subjectId:    text("subject_id"),
  teacherId:    text("teacher_id"),
  room:         text("room"),
  version:      integer("version").default(1).notNull(),
  updatedBy:    text("updated_by"),
  deviceName:   text("device_name"),
  updatedAt:    timestamp("updated_at").defaultNow().notNull(),
});

export const syncConflicts = pgTable("ac_sync_conflicts", {
  id:             text("id").primaryKey().notNull(),
  entity:         text("entity").notNull(),
  entityId:       text("entity_id").notNull(),
  field:          text("field").notNull(),
  serverValue:    text("server_value"),
  incomingValue:  text("incoming_value"),
  incomingBy:     text("incoming_by"),
  incomingDevice: text("incoming_device"),
  status:         text("status").default("pending").notNull(),
  resolution:     text("resolution"),
  customValue:    text("custom_value"),
  createdAt:      timestamp("created_at").defaultNow().notNull(),
  resolvedAt:     timestamp("resolved_at"),
});

export const schoolData = pgTable("ac_school_data", {
  id:        text("id").primaryKey().notNull().default("global"),
  data:      text("data").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
