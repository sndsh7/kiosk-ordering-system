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
    photos: resolved?.photos ?? [],
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
    balance: resolved?.balance ?? 0,
    photos: resolved?.photos ?? []
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
  let groupName = null;
  let photos = [];

  if (state.refId) {
    if (state.mode === "INDIVIDUAL") {
      const u = await prisma.user.update({
        where: { id: state.refId },
        data: { individualPoints: { increment: delta } }
      });
      newBalance = u.individualPoints;
      entityName = u.name;
      photos = u.photoUrl ? [u.photoUrl] : [];
    } else if (state.mode === "PAIR") {
      const p = await prisma.pair.update({
        where: { id: state.refId },
        data: { pairPoints: { increment: delta } },
        include: { user1: true, user2: true }
      });
      newBalance = p.pairPoints;
      entityName = `${p.user1.name} + ${p.user2.name}`;
      photos = [p.user1.photoUrl, p.user2.photoUrl].filter(Boolean);
    } else if (state.mode === "GROUP") {
      const g = await prisma.group.update({
        where: { id: state.refId },
        data: { groupPoints: { increment: delta } },
        include: { members: { include: { user: true } } }
      });
      newBalance = g.groupPoints;
      groupName = g.name;
      entityName = g.name; // Use group name instead of member names
      photos = g.photoUrl ? [g.photoUrl] : g.members.map(m => m.user.photoUrl).filter(Boolean);
    }
  }

  // Emit flash event to kiosk screen
  req.io.emit("kiosk:flash", {
    type,
    points: Math.abs(Number(points)),
    newBalance,
    entityName,
    groupName,
    mode: state.mode,
  });

  // Also emit updated status so balance refreshes
  req.io.emit("kiosk:update", {
    isActive: state.isActive,
    mode: state.mode,
    refId: state.refId,
    entityName,
    groupName,
    balance: newBalance,
    photos,
  });

  res.json({ ok: true, newBalance, entityName, groupName });
});

async function resolveEntity(prisma, mode, refId) {
  if (!refId) return null;

  if (mode === "INDIVIDUAL") {
    const u = await prisma.user.findUnique({ where: { id: refId } });
    if (!u) return null;
    return { name: u.name, balance: u.individualPoints, photos: u.photoUrl ? [u.photoUrl] : [] };
  }
  if (mode === "PAIR") {
    const p = await prisma.pair.findUnique({
      where: { id: refId },
      include: { user1: true, user2: true }
    });
    if (!p) return null;
    return { 
      name: `${p.user1.name} + ${p.user2.name}`, 
      balance: p.pairPoints,
      photos: [p.user1.photoUrl, p.user2.photoUrl].filter(Boolean)
    };
  }
  if (mode === "GROUP") {
    const g = await prisma.group.findUnique({ 
      where: { id: refId },
      include: { members: { include: { user: true } } }
    });
    if (!g) return null;
    const photos = g.photoUrl ? [g.photoUrl] : g.members.map(m => m.user.photoUrl).filter(Boolean);
    return { name: g.name, balance: g.groupPoints, photos };
  }
  return null;
}
