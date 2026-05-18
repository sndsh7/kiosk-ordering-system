import express from "express";
import bcrypt from "bcryptjs";
import { signAdminToken } from "../auth.js";

export const adminRouter = express.Router();

adminRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const prisma = req.prisma;

  const admin = await prisma.adminUser.findUnique({ where: { username } });
  if (!admin) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, admin.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signAdminToken(admin);
  res.json({ token });
});
