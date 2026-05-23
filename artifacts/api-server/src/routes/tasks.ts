import { Router } from "express";
import { db } from "@workspace/db";
import { tasksTable } from "@workspace/db";
import { sql, eq } from "drizzle-orm";
import {
  GetTasksQueryParams,
  CreateTaskBody,
  UpdateTaskParams,
  UpdateTaskBody,
  DeleteTaskParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/tasks", async (req, res) => {
  try {
    const query = GetTasksQueryParams.safeParse(req.query);
    const { projectId, status } = query.success ? query.data : { projectId: undefined, status: undefined };

    let rows = await db.select().from(tasksTable).orderBy(sql`${tasksTable.createdAt} DESC`);

    if (projectId !== undefined) rows = rows.filter((r) => r.projectId === projectId);
    if (status) rows = rows.filter((r) => r.status === status);

    res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to get tasks");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/tasks", async (req, res) => {
  try {
    const parsed = CreateTaskBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const [row] = await db.insert(tasksTable).values(parsed.data).returning();
    return res.status(201).json({ ...row, createdAt: row!.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create task");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/tasks/:id", async (req, res) => {
  try {
    const { id } = UpdateTaskParams.parse(req.params);
    const parsed = UpdateTaskBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const [row] = await db.update(tasksTable).set(parsed.data).where(eq(tasksTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json({ ...row, createdAt: row.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update task");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = DeleteTaskParams.parse(req.params);
    await db.delete(tasksTable).where(eq(tasksTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete task");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
