/**
 * JWT-based authentication middleware and routes.
 */
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { pool } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey-change-in-production";
const SALT_ROUNDS = 10;

/**
 * Middleware: verify JWT from Authorization header.
 */
export function authenticateJWT(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token" });
  }
  const token = header.substring(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, email }
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

/**
 * POST /auth/signup
 */
export async function signup(req, res) {
  const { email, password, full_name, department } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }
  try {
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const id = crypto.randomUUID();
    await pool.query(
      "INSERT INTO profiles (id, email, password, full_name, department, approved) VALUES (?, ?, ?, ?, ?, ?)",
      [id, email, hashed, full_name || null, department || null, 0]
    );
    // The very first account created becomes the Principal — full site access,
    // auto-approved, and the one who approves everyone else afterwards.
    const [rows] = await pool.query("SELECT COUNT(*) as cnt FROM profiles");
    const isFirstUser = rows[0].cnt === 1;
    if (isFirstUser) {
      await pool.query(
        "INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, 'principal')",
        [crypto.randomUUID(), id]
      );
      await pool.query(
        "INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, 'admin')",
        [crypto.randomUUID(), id]
      );
      await pool.query("UPDATE profiles SET approved = 1 WHERE id = ?", [id]);
    }
    const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      token,
      user: {
        id, email, full_name,
        department: department || null,
        approved: isFirstUser,
      },
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Email already exists" });
    }
    console.error("[signup]", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * POST /auth/signin
 */
export async function signin(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }
  try {
    const [rows] = await pool.query("SELECT * FROM profiles WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      token,
      user: {
        id: user.id, email: user.email, full_name: user.full_name,
        department: user.department, approved: !!user.approved,
      },
    });
  } catch (err) {
    console.error("[signin]", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * GET /auth/me (protected)
 */
export async function me(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT id, email, full_name, department, approved, created_at FROM profiles WHERE id = ?",
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ ...rows[0], approved: !!rows[0].approved });
  } catch (err) {
    console.error("[me]", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * GET /auth/roles (protected)
 */
export async function getRoles(req, res) {
  try {
    const [rows] = await pool.query("SELECT role FROM user_roles WHERE user_id = ?", [req.user.id]);
    res.json(rows.map(r => r.role));
  } catch (err) {
    console.error("[getRoles]", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * GET /auth/profiles (protected, admin/principal only)
 */
export async function getProfiles(req, res) {
  try {
    // Verify that request is from admin/principal (the overall authenticator)
    const [adminCheck] = await pool.query(
      "SELECT 1 FROM user_roles WHERE user_id = ? AND role IN ('admin', 'principal') LIMIT 1",
      [req.user.id]
    );
    if (adminCheck.length === 0) {
      return res.status(403).json({ message: "Forbidden — Only administrators/principals can access all profiles" });
    }

    const [profiles] = await pool.query(
      "SELECT id, email, full_name, department, approved, created_at FROM profiles"
    );
    const [roles] = await pool.query("SELECT user_id, role FROM user_roles");

    const profileList = profiles.map(p => {
      const userRoles = roles.filter(r => r.user_id === p.id).map(r => r.role);
      return {
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        department: p.department,
        approved: !!p.approved,
        created_at: p.created_at,
        roles: userRoles
      };
    });

    res.json(profileList);
  } catch (err) {
    console.error("[getProfiles]", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * POST /auth/set-approval (protected, admin/principal only)
 * Body: { userId, approved: boolean }
 * Only the Principal (overall admin) can approve or revoke a staff member's access.
 */
export async function setApproval(req, res) {
  const { userId, approved } = req.body;
  if (!userId || typeof approved !== "boolean") {
    return res.status(400).json({ message: "userId and approved (boolean) are required" });
  }
  try {
    const [adminCheck] = await pool.query(
      "SELECT 1 FROM user_roles WHERE user_id = ? AND role IN ('admin', 'principal') LIMIT 1",
      [req.user.id]
    );
    if (adminCheck.length === 0) {
      return res.status(403).json({ message: "Forbidden — Only the Principal can approve staff access" });
    }
    await pool.query("UPDATE profiles SET approved = ? WHERE id = ?", [approved ? 1 : 0, userId]);
    res.json({ message: approved ? "Staff member approved" : "Staff access revoked" });
  } catch (err) {
    console.error("[setApproval]", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * POST /auth/assign-role (protected, admin/principal only)
 */
export async function assignRole(req, res) {
  const { userId, role, action } = req.body;
  if (!userId || !role || !["add", "remove"].includes(action)) {
    return res.status(400).json({ message: "userId, role, and action ('add' | 'remove') are required" });
  }
  try {
    // Verify that request is from admin/principal (the overall authenticator)
    const [adminCheck] = await pool.query(
      "SELECT 1 FROM user_roles WHERE user_id = ? AND role IN ('admin', 'principal') LIMIT 1",
      [req.user.id]
    );
    if (adminCheck.length === 0) {
      return res.status(403).json({ message: "Forbidden — Only administrators/principals can assign roles" });
    }

    if (action === "remove") {
      await pool.query("DELETE FROM user_roles WHERE user_id = ? AND role = ?", [userId, role]);
    } else {
      await pool.query(
        "INSERT IGNORE INTO user_roles (id, user_id, role) VALUES (?, ?, ?)",
        [crypto.randomUUID(), userId, role]
      );
    }
    res.json({ message: `Role ${role} ${action === "add" ? "assigned" : "removed"} successfully` });
  } catch (err) {
    console.error("[assignRole]", err);
    res.status(500).json({ message: "Server error" });
  }
}
