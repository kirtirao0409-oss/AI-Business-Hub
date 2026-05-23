import { Router } from "express";
import { db } from "@workspace/db";
import { leadsTable, candidatesTable, projectsTable, activityTable } from "@workspace/db";
import { sql, eq, count } from "drizzle-orm";

const router = Router();

router.get("/analytics/summary", async (req, res) => {
  try {
    const [leadsResult] = await db
      .select({ count: count() })
      .from(leadsTable)
      .where(sql`${leadsTable.status} NOT IN ('won', 'lost')`);

    const [revenueResult] = await db
      .select({ total: sql<string>`COALESCE(SUM(${leadsTable.value}), 0)` })
      .from(leadsTable)
      .where(eq(leadsTable.status, "won"));

    const [openPositionsResult] = await db
      .select({ count: count() })
      .from(candidatesTable)
      .where(sql`${candidatesTable.stage} NOT IN ('hired', 'rejected')`);

    const [activeProjectsResult] = await db
      .select({ count: count() })
      .from(projectsTable)
      .where(eq(projectsTable.status, "active"));

    res.json({
      totalRevenue: parseFloat(revenueResult?.total ?? "0"),
      activeLeads: leadsResult?.count ?? 0,
      openPositions: openPositionsResult?.count ?? 0,
      activeProjects: activeProjectsResult?.count ?? 0,
      revenueGrowth: 12.5,
      leadGrowth: 8.3,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get analytics summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/analytics/revenue", async (_req, res) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const data = months.map((month, i) => ({
    month,
    revenue: 40000 + Math.round(Math.sin(i * 0.8) * 15000 + i * 3500 + Math.random() * 8000),
    target: 50000 + i * 2000,
  }));
  res.json(data);
});

router.get("/analytics/activity", async (req, res) => {
  try {
    const items = await db
      .select()
      .from(activityTable)
      .orderBy(sql`${activityTable.timestamp} DESC`)
      .limit(20);

    res.json(
      items.map((item) => ({
        id: item.id,
        type: item.type,
        description: item.description,
        timestamp: item.timestamp.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to get activity");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
