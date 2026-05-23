import { Router } from "express";
import { db } from "@workspace/db";
import { leadsTable, insertLeadSchema } from "@workspace/db";
import { sql, eq, count, ilike, or } from "drizzle-orm";
import {
  GetLeadsQueryParams,
  CreateLeadBody,
  GetLeadParams,
  UpdateLeadParams,
  UpdateLeadBody,
  DeleteLeadParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/leads", async (req, res) => {
  try {
    const query = GetLeadsQueryParams.safeParse(req.query);
    const { status, search } = query.success ? query.data : { status: undefined, search: undefined };

    let rows = await db.select().from(leadsTable).orderBy(sql`${leadsTable.createdAt} DESC`);

    if (status) {
      rows = rows.filter((r) => r.status === status);
    }
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(s) ||
          r.company.toLowerCase().includes(s) ||
          r.email.toLowerCase().includes(s)
      );
    }

    res.json(
      rows.map((r) => ({
        ...r,
        value: parseFloat(r.value as string),
        createdAt: r.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to get leads");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/leads", async (req, res) => {
  try {
    const parsed = CreateLeadBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }
    const { name, company, email, phone, status, value, source, notes } = parsed.data;
    const [row] = await db
      .insert(leadsTable)
      .values({ name, company, email, phone, status, value: String(value ?? 0), source, notes })
      .returning();

    await db.insert(await import("@workspace/db").then(m => m.activityTable)).values({
      type: "lead",
      description: `New lead added: ${name} from ${company}`,
    });

    return res.status(201).json({
      ...row,
      value: parseFloat(row!.value as string),
      createdAt: row!.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create lead");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/leads/pipeline", async (req, res) => {
  try {
    const stages = ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"];
    const rows = await db
      .select({
        status: leadsTable.status,
        count: count(),
        total: sql<string>`COALESCE(SUM(${leadsTable.value}), 0)`,
      })
      .from(leadsTable)
      .groupBy(leadsTable.status);

    const stageMap = Object.fromEntries(rows.map((r) => [r.status, r]));
    res.json(
      stages.map((stage) => ({
        stage,
        count: stageMap[stage]?.count ?? 0,
        value: parseFloat(stageMap[stage]?.total ?? "0"),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to get lead pipeline");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/leads/:id", async (req, res) => {
  try {
    const { id } = GetLeadParams.parse(req.params);
    const [row] = await db.select().from(leadsTable).where(eq(leadsTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json({ ...row, value: parseFloat(row.value as string), createdAt: row.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to get lead");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/leads/:id", async (req, res) => {
  try {
    const { id } = UpdateLeadParams.parse(req.params);
    const parsed = UpdateLeadBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const { value, ...rest } = parsed.data;
    const updates: Record<string, unknown> = { ...rest };
    if (value !== undefined) updates.value = String(value);
    const [row] = await db.update(leadsTable).set(updates).where(eq(leadsTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json({ ...row, value: parseFloat(row.value as string), createdAt: row.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update lead");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/leads/:id", async (req, res) => {
  try {
    const { id } = DeleteLeadParams.parse(req.params);
    await db.delete(leadsTable).where(eq(leadsTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete lead");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
