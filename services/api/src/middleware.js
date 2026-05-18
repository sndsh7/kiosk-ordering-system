import { verifyToken } from "./auth.js";

export function requireAdmin(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });

    const payload = verifyToken(token);
    if (payload.role !== "admin") return res.status(403).json({ error: "Forbidden" });

    req.admin = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
