import express from "express";
import { requireAdmin } from "../middleware.js";

export const kioskRouter = express.Router();

kioskRouter.get("/status", async (req, res) => {
  const prisma = req.prisma;

  let state = await prisma.kioskState.findFirst();
  if (!state) state = await prisma.kioskState.create({ data: {} });

  const resolved = await resolveEntity(prisma, state.mode, state.refId);

  res.json({
    isActive: state.isActive,
    mode: state.mode,
    refId: state.refId,
    entityName: resolved?.name ?? null,
    balance: resolved?.balance ?? 0,
    updatedAt: state.updatedAt
  });
});

kioskRouter.post("/setMode", requireAdmin, async (req, res) => {
  const prisma = req.prisma;
  const { isActive, mode, refId } = req.body;

  let state = await prisma.kioskState.findFirst();
  if (!state) state = await prisma.kioskState.create({ data: {} });

  const updated = await prisma.kioskState.update({
    where: { id: state.id },
    data: {
      isActive: typeof isActive === "boolean" ? isActive : state.isActive,
      mode: mode ?? state.mode,
      refId: refId ?? state.refId
    }
  });

  const resolved = await resolveEntity(prisma, updated.mode, updated.refId);

  req.io.emit("kiosk:update", {
    isActive: updated.isActive,
    mode: updated.mode,
    refId: updated.refId,
    entityName: resolved?.name ?? null,
    balance: resolved?.balance ?? 0
  });

  res.json({ ok: true });
});

// Admin sends bonus / penalty → adjusts balance & flashes kiosk screen
kioskRouter.post("/notify", requireAdmin, async (req, res) => {
  const prisma = req.prisma;
  const { type, points } = req.body; // type: "BONUS" | "PENALTY", points: number

  const delta = type === "PENALTY" ? -Math.abs(Number(points)) : Math.abs(Number(points));

  let state = await prisma.kioskState.findFirst();
  if (!state) return res.status(400).json({ error: "No kiosk state" });

  let newBalance = 0;
  let entityName = "";

  if (state.refId) {
    if (state.mode === "INDIVIDUAL") {
      const u = await prisma.user.update({
        where: { id: state.refId },
        data: { individualPoints: { increment: delta } }
      });
      newBalance = u.individualPoints;
      entityName = u.name;
    } else if (state.mode === "PAIR") {
      const p = await prisma.pair.update({
        where: { id: state.refId },
        data: { pairPoints: { increment: delta } },
        include: { user1: true, user2: true }
      });
      newBalance = p.pairPoints;
      entityName = `${p.user1.name} + ${p.user2.name}`;
    } else if (state.mode === "GROUP") {
      const g = await prisma.group.update({
        where: { id: state.refId },
        data: { groupPoints: { increment: delta } }
      });
      newBalance = g.groupPoints;
      entityName = g.name;
    }
  }

  // Emit flash event to kiosk screen
  req.io.emit("kiosk:flash", {
    type,        // "BONUS" | "PENALTY"
    points: Math.abs(Number(points)),
    newBalance,
    entityName,
    mode: state.mode,
  });

  // Also emit updated status so balance refreshes
  req.io.emit("kiosk:update", {
    isActive: state.isActive,
    mode: state.mode,
    refId: state.refId,
    entityName,
    balance: newBalance,
  });

  res.json({ ok: true, newBalance, entityName });
});

async function resolveEntity(prisma, mode, refId) {
  if (!refId) return null;

  if (mode === "INDIVIDUAL") {
    const u = await prisma.user.findUnique({ where: { id: refId } });
    if (!u) return null;
    return { name: u.name, balance: u.individualPoints };
  }
  if (mode === "PAIR") {
    const p = await prisma.pair.findUnique({
      where: { id: refId },
      include: { user1: true, user2: true }
    });
    if (!p) return null;
    return { name: `${p.user1.name} + ${p.user2.name}`, balance: p.pairPoints };
  }
  if (mode === "GROUP") {
    const g = await prisma.group.findUnique({ where: { id: refId } });
    if (!g) return null;
    return { name: g.name, balance: g.groupPoints };
  }
  return null;
}
