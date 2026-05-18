import express from "express";
import { requireAdmin } from "../middleware.js";

export const ordersRouter = express.Router();

// Kiosk places order
ordersRouter.post("/orders", async (req, res) => {
  const prisma = req.prisma;
  const { items } = req.body; // [{ itemId, quantity }]

  const state = await prisma.kioskState.findFirst();
  if (!state || !state.isActive) return res.status(400).json({ error: "Kiosk inactive" });
  if (!state.refId) return res.status(400).json({ error: "No active user/pair/group assigned" });

  const itemIds = items.map(i => Number(i.itemId));
  const dbItems = await prisma.item.findMany({ where: { id: { in: itemIds } } });
  const byId = new Map(dbItems.map(x => [x.id, x]));

  for (const line of items) {
    const dbi = byId.get(Number(line.itemId));
    if (!dbi || !dbi.available) {
      return res.status(409).json({ error: "ITEM_UNAVAILABLE", itemId: line.itemId });
    }
  }

  const computedLines = items.map(line => {
    const dbi = byId.get(Number(line.itemId));
    return {
      itemId: dbi.id,
      quantity: Number(line.quantity),
      pricePoints: dbi.pricePoints
    };
  });

  const totalPoints = computedLines.reduce((sum, l) => sum + l.quantity * l.pricePoints, 0);

  try {
    const order = await prisma.$transaction(async (tx) => {
      const balance = await getBalance(tx, state.mode, state.refId);
      if (totalPoints > balance) {
        const err = new Error("INSUFFICIENT");
        err.code = "INSUFFICIENT";
        err.balance = balance;
        throw err;
      }

      await deduct(tx, state.mode, state.refId, totalPoints);

      return tx.order.create({
        data: {
          mode: state.mode,
          refId: state.refId,
          totalPoints,
          items: {
            create: computedLines.map(l => ({
              itemId: l.itemId,
              quantity: l.quantity,
              pricePoints: l.pricePoints
            }))
          }
        },
        include: { items: { include: { item: true } } }
      });
    });

    req.io.emit("order:new", { orderId: order.id });

    res.json({ orderId: order.id, totalPoints: order.totalPoints });
  } catch (e) {
    if (e.code === "INSUFFICIENT") {
      return res.status(409).json({ error: "INSUFFICIENT_BALANCE", balance: e.balance });
    }
    console.error(e);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// Admin endpoints
ordersRouter.get("/orders", requireAdmin, async (req, res) => {
  const orders = await req.prisma.order.findMany({
    include: { items: { include: { item: true } } },
    orderBy: { createdAt: "desc" }
  });

  const enrichedOrders = await Promise.all(orders.map(async (o) => {
    let entityName = "Unknown";
    if (o.mode === "INDIVIDUAL" && o.refId) {
      const u = await req.prisma.user.findUnique({ where: { id: o.refId } });
      if (u) entityName = u.name;
    } else if (o.mode === "PAIR" && o.refId) {
      const p = await req.prisma.pair.findUnique({ 
        where: { id: o.refId },
        include: { user1: true, user2: true } 
      });
      if (p) entityName = `${p.user1.name} & ${p.user2.name}`;
    } else if (o.mode === "GROUP" && o.refId) {
      const g = await req.prisma.group.findUnique({ where: { id: o.refId } });
      if (g) entityName = g.name;
    }
    return { ...o, entityName };
  }));

  res.json(enrichedOrders);
});

ordersRouter.get("/orders/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const order = await req.prisma.order.findUnique({
    where: { id },
    include: { items: { include: { item: true } } }
  });

  if (!order) return res.status(404).json({ error: "Not found" });

  let entityName = "Unknown";
  if (order.mode === "INDIVIDUAL" && order.refId) {
    const u = await req.prisma.user.findUnique({ where: { id: order.refId } });
    if (u) entityName = u.name;
  } else if (order.mode === "PAIR" && order.refId) {
    const p = await req.prisma.pair.findUnique({ 
      where: { id: order.refId },
      include: { user1: true, user2: true } 
    });
    if (p) entityName = `${p.user1.name} & ${p.user2.name}`;
  } else if (order.mode === "GROUP" && order.refId) {
    const g = await req.prisma.group.findUnique({ where: { id: order.refId } });
    if (g) entityName = g.name;
  }

  res.json({ ...order, entityName });
});

ordersRouter.get("/orders/:id/receipt", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const order = await req.prisma.order.findUnique({
    where: { id },
    include: { items: { include: { item: true } } }
  });
  if (!order) return res.status(404).json({ error: "Not found" });

  let entityName = "Unknown";
  if (order.mode === "INDIVIDUAL" && order.refId) {
    const u = await req.prisma.user.findUnique({ where: { id: order.refId } });
    if (u) entityName = u.name;
  } else if (order.mode === "PAIR" && order.refId) {
    const p = await req.prisma.pair.findUnique({ 
      where: { id: order.refId },
      include: { user1: true, user2: true } 
    });
    if (p) entityName = `${p.user1.name} & ${p.user2.name}`;
  } else if (order.mode === "GROUP" && order.refId) {
    const g = await req.prisma.group.findUnique({ where: { id: order.refId } });
    if (g) entityName = g.name;
  }

  res.json({
    orderId: order.id,
    createdAt: order.createdAt,
    mode: order.mode,
    refId: order.refId,
    entityName,
    total: order.totalPoints,
    items: order.items.map(oi => ({
      name: oi.item.name,
      qty: oi.quantity,
      price: oi.pricePoints,
      subtotal: oi.quantity * oi.pricePoints
    }))
  });
});

async function getBalance(tx, mode, refId) {
  if (mode === "INDIVIDUAL") {
    const u = await tx.user.findUnique({ where: { id: refId } });
    return u?.individualPoints ?? 0;
  }
  if (mode === "PAIR") {
    const p = await tx.pair.findUnique({ where: { id: refId } });
    return p?.pairPoints ?? 0;
  }
  if (mode === "GROUP") {
    const g = await tx.group.findUnique({ where: { id: refId } });
    return g?.groupPoints ?? 0;
  }
  return 0;
}

async function deduct(tx, mode, refId, amount) {
  if (mode === "INDIVIDUAL") {
    return tx.user.update({ where: { id: refId }, data: { individualPoints: { decrement: amount } } });
  }
  if (mode === "PAIR") {
    return tx.pair.update({ where: { id: refId }, data: { pairPoints: { decrement: amount } } });
  }
  if (mode === "GROUP") {
    return tx.group.update({ where: { id: refId }, data: { groupPoints: { decrement: amount } } });
  }
}
