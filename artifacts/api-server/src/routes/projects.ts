import { Router } from "express";
import { db } from "@workspace/db";
import { projectsTable, activityTable } from "@workspace/db";
import { sql, eq, count } from "drizzle-orm";
import {
  CreateProjectBody,
  UpdateProjectParams,
  UpdateProjectBody,
  DeleteProjectParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/projects", async (req, res) => {
  try {
    const rows = await db.select().from(projectsTable).orderBy(sql`${projectsTable.createdAt} DESC`);
    res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to get projects");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/projects", async (req, res) => {
  try {
    const parsed = CreateProjectBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const [row] = await db.insert(projectsTable).values(parsed.data).returning();

    await db.insert(activityTable).values({
      type: "project",
      description: `New project created: ${parsed.data.name}`,
    });

    return res.status(201).json({ ...row, createdAt: row!.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create project");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/projects/stats", async (_req, res) => {
  try {
    const rows = await db
      .select({ status: projectsTable.status, count: count() })
      .from(projectsTable)
      .groupBy(projectsTable.status);

    const map = Object.fromEntries(rows.map((r) => [r.status, r.count]));
    res.json({
      total: rows.reduce((sum, r) => sum + r.count, 0),
      active: map["active"] ?? 0,
      completed: map["completed"] ?? 0,
      onHold: map["on_hold"] ?? 0,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/projects/:id", async (req, res) => {
  try {
    const { id } = UpdateProjectParams.parse(req.params);
    const parsed = UpdateProjectBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const [row] = await db.update(projectsTable).set(parsed.data).where(eq(projectsTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json({ ...row, createdAt: row.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update project");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/projects/:id", async (req, res) => {
  try {
    const { id } = DeleteProjectParams.parse(req.params);
    await db.delete(projectsTable).where(eq(projectsTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete project");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
