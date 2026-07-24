/**
 * Academic Compass — Express + MySQL backend
 * Runs on port 3001. Vite proxies /api/* here.
 */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDb } from "./db.js";
import { signup, signin, me, getRoles, getProfiles, assignRole, setApproval, authenticateJWT } from "./auth.js";
import markEntriesRouter from "./routes/markEntries.js";
import timetableSlotsRouter from "./routes/timetableSlots.js";
import conflictsRouter from "./routes/conflicts.js";

dotenv.config();

const app        = express();
const PORT       = process.env.PORT || 3001;
const FRONTEND   = process.env.FRONTEND_URL || "http://localhost:8080";

// ---- CORS: allow the Vite dev server ----
app.use(cors({
  origin: FRONTEND,
  credentials: true,
}));

app.use(express.json());

// ---- Auth routes ----
app.post("/api/auth/signup", signup);
app.post("/api/auth/signin", signin);
app.get("/api/auth/me",      authenticateJWT, me);
app.get("/api/auth/roles",   authenticateJWT, getRoles);
app.get("/api/auth/profiles", authenticateJWT, getProfiles);
app.post("/api/auth/assign-role", authenticateJWT, assignRole);
app.post("/api/auth/set-approval", authenticateJWT, setApproval);

// ---- Data routes (all JWT-protected) ----
app.use("/api/mark-entries",    markEntriesRouter);
app.use("/api/timetable-slots", timetableSlotsRouter);
app.use("/api/conflicts",       conflictsRouter);

// ---- Start ----
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[server] Academic Compass API → http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[server] Failed to initialize DB:", err);
    process.exit(1);
  });
