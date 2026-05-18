import express from "express";
import { requireAdmin } from "../middleware.js";

export const catalogRouter = express.Router();

catalogRouter.get("/categories", async (req, res) => {
  const includeInactive = req.query.showInactive === "true";
  const categories = await req.prisma.category.findMany({
    where: includeInactive ? undefined : { active: true },
    orderBy: { id: "asc" }
  });
  res.json(categories);
});

catalogRouter.get("/items", async (req, res) => {
  const categoryId = req.query.categoryId ? Number(req.query.categoryId) : null;
  const includeUnavailable = req.query.showUnavailable === "true";
  const items = await req.prisma.item.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(includeUnavailable ? {} : { available: true })
    },
    orderBy: { id: "asc" }
  });
  res.json(items);
});

// Admin CRUD
catalogRouter.post("/categories", requireAdmin, async (req, res) => {
  const { name, active } = req.body;
  const created = await req.prisma.category.create({ data: { name, active: active ?? true } });
  res.json(created);
});

catalogRouter.put("/categories/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const updated = await req.prisma.category.update({ where: { id }, data: req.body });
  res.json(updated);
});

catalogRouter.delete("/categories/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await req.prisma.category.delete({ where: { id } });
  res.json({ ok: true });
});

catalogRouter.post("/items", requireAdmin, async (req, res) => {
  const created = await req.prisma.item.create({ data: req.body });
  res.json(created);
});

catalogRouter.put("/items/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const updated = await req.prisma.item.update({ where: { id }, data: req.body });
  res.json(updated);
});

catalogRouter.delete("/items/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await req.prisma.item.delete({ where: { id } });
  res.json({ ok: true });
});
