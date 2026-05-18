import express from "express";
import { requireAdmin } from "../middleware.js";

export const entitiesRouter = express.Router();
entitiesRouter.use(requireAdmin);

// ─── USERS ────────────────────────────────────────────────────────────────────
entitiesRouter.get("/users", async (req, res) => {
  res.json(await req.prisma.user.findMany({ orderBy: { id: "asc" } }));
});

entitiesRouter.post("/users", async (req, res) => {
  res.json(await req.prisma.user.create({ data: req.body }));
});

entitiesRouter.put("/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  res.json(await req.prisma.user.update({ where: { id }, data: req.body }));
});

entitiesRouter.delete("/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  await req.prisma.user.delete({ where: { id } });
  res.json({ ok: true });
});

entitiesRouter.put("/users/:id/points", async (req, res) => {
  const id = Number(req.params.id);
  const { delta } = req.body;
  const updated = await req.prisma.user.update({
    where: { id },
    data: { individualPoints: { increment: Number(delta) } }
  });
  res.json(updated);
});

// ─── PAIRS ────────────────────────────────────────────────────────────────────
entitiesRouter.get("/pairs", async (req, res) => {
  res.json(await req.prisma.pair.findMany({
    include: { user1: true, user2: true },
    orderBy: { id: "asc" }
  }));
});

entitiesRouter.post("/pairs", async (req, res) => {
  const { user1Id, user2Id, pairPoints } = req.body;
  if (user1Id === user2Id)
    return res.status(400).json({ error: "Pair users must be different" });
  const created = await req.prisma.pair.create({
    data: { user1Id, user2Id, pairPoints: pairPoints ?? 0 },
    include: { user1: true, user2: true }
  });
  res.json(created);
});

// Update pairPoints only
entitiesRouter.put("/pairs/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { pairPoints } = req.body;
  const updated = await req.prisma.pair.update({
    where: { id },
    data: { pairPoints: Number(pairPoints) },
    include: { user1: true, user2: true }
  });
  res.json(updated);
});

entitiesRouter.delete("/pairs/:id", async (req, res) => {
  const id = Number(req.params.id);
  await req.prisma.pair.delete({ where: { id } });
  res.json({ ok: true });
});

// ─── GROUPS ───────────────────────────────────────────────────────────────────
entitiesRouter.get("/groups", async (req, res) => {
  res.json(await req.prisma.group.findMany({
    include: { members: { include: { user: true } } },
    orderBy: { id: "asc" }
  }));
});

entitiesRouter.post("/groups", async (req, res) => {
  const { name, groupPoints, userIds = [] } = req.body;
  const created = await req.prisma.group.create({
    data: {
      name,
      groupPoints: groupPoints ?? 0,
      members: { create: userIds.map((userId) => ({ userId })) }
    },
    include: { members: { include: { user: true } } }
  });
  res.json(created);
});

// Full update: name, groupPoints, members
entitiesRouter.put("/groups/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { name, groupPoints, userIds } = req.body;

  // Replace members when userIds is provided
  if (Array.isArray(userIds)) {
    await req.prisma.groupMember.deleteMany({ where: { groupId: id } });
    if (userIds.length > 0) {
      await req.prisma.groupMember.createMany({
        data: userIds.map((uid) => ({ groupId: id, userId: Number(uid) }))
      });
    }
  }

  const updated = await req.prisma.group.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(groupPoints !== undefined && { groupPoints: Number(groupPoints) })
    },
    include: { members: { include: { user: true } } }
  });
  res.json(updated);
});

entitiesRouter.delete("/groups/:id", async (req, res) => {
  const id = Number(req.params.id);
  // Must delete members first (FK constraint)
  await req.prisma.groupMember.deleteMany({ where: { groupId: id } });
  await req.prisma.group.delete({ where: { id } });
  res.json({ ok: true });
});
