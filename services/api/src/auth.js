import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable. Set it in services/api/.env.");
}

export function signAdminToken(admin) {
  return jwt.sign(
    { sub: admin.id, username: admin.username, role: "admin" },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
