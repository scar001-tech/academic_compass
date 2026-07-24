/**
 * MySQL connection pool using mysql2/promise.
 * Configure via environment variables (see .env).
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const pool = mysql.createPool({
  host:     process.env.DB_HOST     || "localhost",
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME     || "academic_compass",
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

/** Run the initial DDL once on startup. */
export async function initDb() {
  const conn = await pool.getConnection();
  try {
    // Profiles / users
    await conn.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id          VARCHAR(36) PRIMARY KEY,
        email       VARCHAR(255) UNIQUE NOT NULL,
        full_name   VARCHAR(255),
        password    VARCHAR(255) NULL,
        google_id   VARCHAR(100) NULL,
        avatar_url  TEXT NULL,
        department  VARCHAR(100) NULL,
        approved    TINYINT(1) NOT NULL DEFAULT 0,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // Add OAuth / approval-workflow columns to existing tables if upgrading
    await conn.query(`
      ALTER TABLE profiles
        ADD COLUMN IF NOT EXISTS google_id  VARCHAR(100) NULL,
        ADD COLUMN IF NOT EXISTS avatar_url TEXT NULL,
        ADD COLUMN IF NOT EXISTS department VARCHAR(100) NULL,
        ADD COLUMN IF NOT EXISTS approved   TINYINT(1) NOT NULL DEFAULT 0
    `).catch(() => {}); // ignore if already exists

    // Roles
    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id      VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        role    ENUM('admin','principal','hod','class_teacher','subject_teacher','teacher','senior_teacher') NOT NULL,
        UNIQUE KEY uniq_user_role (user_id, role),
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
      )
    `);
    // Ensure existing user_roles table supports new ENUM values
    await conn.query(`
      ALTER TABLE user_roles MODIFY COLUMN role ENUM('admin','principal','hod','class_teacher','subject_teacher','teacher','senior_teacher') NOT NULL
    `).catch(() => {});

    // Mark entries
    await conn.query(`
      CREATE TABLE IF NOT EXISTS mark_entries (
        id              VARCHAR(36) PRIMARY KEY,
        curriculum_id   VARCHAR(10) NOT NULL,
        sheet_id        VARCHAR(100) NOT NULL,
        student_id      VARCHAR(100) NOT NULL,
        score           DECIMAL(6,2),
        override_grade  VARCHAR(10),
        updated_by      VARCHAR(36),
        device_name     VARCHAR(100),
        version         INT NOT NULL DEFAULT 1,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Timetable slots
    await conn.query(`
      CREATE TABLE IF NOT EXISTS timetable_slots (
        id            VARCHAR(36) PRIMARY KEY,
        curriculum_id VARCHAR(10) NOT NULL,
        class_id      VARCHAR(100) NOT NULL,
        stream_id     VARCHAR(100),
        day_of_week   TINYINT NOT NULL,
        period        TINYINT NOT NULL,
        start_time    VARCHAR(10),
        end_time      VARCHAR(10),
        subject_id    VARCHAR(100),
        teacher_id    VARCHAR(100),
        room          VARCHAR(100),
        version       INT NOT NULL DEFAULT 1,
        updated_by    VARCHAR(36),
        device_name   VARCHAR(100),
        created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Sync conflicts
    await conn.query(`
      CREATE TABLE IF NOT EXISTS sync_conflicts (
        id              VARCHAR(200) PRIMARY KEY,
        entity          VARCHAR(50) NOT NULL,
        entity_id       VARCHAR(200) NOT NULL,
        field           VARCHAR(100) NOT NULL,
        server_value    TEXT,
        incoming_value  TEXT,
        incoming_by     VARCHAR(36),
        incoming_device VARCHAR(100),
        status          ENUM('pending','resolved') DEFAULT 'pending',
        resolution      VARCHAR(20),
        custom_value    TEXT,
        resolved_at     DATETIME,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("[db] Tables ready.");
  } finally {
    conn.release();
  }
}
