import { Router } from "express";
import { db } from "@workspace/db";
import { candidatesTable, activityTable } from "@workspace/db";
import { sql, eq, count } from "drizzle-orm";
import {
  GetCandidatesQueryParams,
  CreateCandidateBody,
  UpdateCandidateParams,
  UpdateCandidateBody,
  DeleteCandidateParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/candidates", async (req, res) => {
  try {
    const query = GetCandidatesQueryParams.safeParse(req.query);
    const { stage, role } = query.success ? query.data : { stage: undefined, role: undefined };

    let rows = await db.select().from(candidatesTable).orderBy(sql`${candidatesTable.appliedAt} DESC`);

    if (stage) rows = rows.filter((r) => r.stage === stage);
    if (role) {
      const r2 = role.toLowerCase();
      rows = rows.filter((r) => r.role.toLowerCase().includes(r2));
    }

    res.json(rows.map((r) => ({ ...r, appliedAt: r.appliedAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to get candidates");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/candidates", async (req, res) => {
  try {
    const parsed = CreateCandidateBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const [row] = await db.insert(candidatesTable).values(parsed.data).returning();

    await db.insert(activityTable).values({
      type: "hr",
      description: `New candidate: ${parsed.data.name} for ${parsed.data.role}`,
    });

    return res.status(201).json({ ...row, appliedAt: row!.appliedAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create candidate");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/candidates/stages", async (_req, res) => {
  try {
    const stages = ["applied", "screening", "interview", "technical", "offer", "hired", "rejected"];
    const rows = await db
      .select({ stage: candidatesTable.stage, count: count() })
      .from(candidatesTable)
      .groupBy(candidatesTable.stage);

    const stageMap = Object.fromEntries(rows.map((r) => [r.stage, r.count]));
    res.json(stages.map((stage) => ({ stage, count: stageMap[stage] ?? 0 })));
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/candidates/:id", async (req, res) => {
  try {
    const { id } = UpdateCandidateParams.parse(req.params);
    const parsed = UpdateCandidateBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const [row] = await db.update(candidatesTable).set(parsed.data).where(eq(candidatesTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json({ ...row, appliedAt: row.appliedAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update candidate");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/candidates/:id", async (req, res) => {
  try {
    const { id } = DeleteCandidateParams.parse(req.params);
    await db.delete(candidatesTable).where(eq(candidatesTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete candidate");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
