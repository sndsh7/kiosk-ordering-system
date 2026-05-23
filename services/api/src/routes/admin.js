import express from "express";
import bcrypt from "bcryptjs";
import { signAdminToken } from "../auth.js";
import { requireAdmin } from "../middleware.js";

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

adminRouter.post("/reset", requireAdmin, async (req, res) => {
  const prisma = req.prisma;
  try {
    await prisma.$transaction([
      prisma.orderItem.deleteMany(),
      prisma.order.deleteMany(),
      prisma.item.deleteMany(),
      prisma.category.deleteMany(),
      prisma.groupMember.deleteMany(),
      prisma.group.deleteMany(),
      prisma.pair.deleteMany(),
      prisma.user.deleteMany(),
      prisma.kioskState.updateMany({
        data: {
          isActive: true,
          mode: "INDIVIDUAL",
          refId: null,
          showItemImages: true,
        }
      })
    ]);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to reset factory" });
  }
});
