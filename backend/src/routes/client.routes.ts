import { Router, Request, Response, NextFunction } from "express";
import Client from "../models/Client";
import { requireAuth } from "../middleware/auth";
import { createError } from "../middleware/errorHandler";
import { logAudit } from "../lib/audit";

const router = Router();

// GET /clients — public (enabled only) or admin all
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const all = req.query.all === "true";
    const filter = all ? {} : { enabled: true };
    const clients = await Client.find(filter).sort({ order: 1, createdAt: 1 });
    res.json(clients);
  } catch (err) { next(err); }
});

// POST /clients — admin
router.post("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = await Client.create(req.body);
    await logAudit(req, "create", "client", client._id.toString(), client.name);
    res.status(201).json(client);
  } catch (err) { next(err); }
});

// PUT /clients/:id — admin
router.put("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!client) return next(createError("Client not found", 404));
    await logAudit(req, "update", "client", client._id.toString(), client.name);
    res.json(client);
  } catch (err) { next(err); }
});

// DELETE /clients/:id — admin
router.delete("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return next(createError("Client not found", 404));
    await logAudit(req, "delete", "client", req.params.id, client.name);
    res.json({ message: "Client deleted" });
  } catch (err) { next(err); }
});

// PUT /clients/reorder — bulk reorder
router.put("/reorder", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { order }: { order: { id: string; order: number }[] } = req.body;
    await Promise.all(order.map(({ id, order: o }) => Client.findByIdAndUpdate(id, { order: o })));
    res.json({ message: "Reordered" });
  } catch (err) { next(err); }
});

export default router;
