import { Router } from "express";
import { db } from "@workspace/db";
import { chatMessagesTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { SendChatMessageBody } from "@workspace/api-zod";

const router = Router();

const AI_RESPONSES = [
  "I've analyzed your pipeline data. You have 3 leads in the proposal stage worth $85,000 combined. I recommend following up with Acme Corp first — they've been in proposal for 12 days.",
  "Based on your project metrics, the Mobile App Redesign is at 68% completion but 3 tasks are overdue. Shall I flag this for the team?",
  "Your HR pipeline shows 5 candidates in the interview stage. The top-scored candidate for the Senior Engineer role has a score of 92. I can draft an offer letter template if you'd like.",
  "Revenue is trending 12.5% above last month. The Q3 target looks achievable if the 2 negotiations in progress close by month end.",
  "I've reviewed your recent activity. You've added 8 new leads this week, which is a 40% increase over last week. Great momentum!",
  "The 'Platform Migration' project has slipped behind schedule. Three tasks are marked 'in progress' but haven't been updated in 5 days. Want me to send a status check to the assignees?",
  "Sure, I can help you draft outreach for your top leads. Which stage would you like to focus on — qualified or proposal?",
];

router.get("/chat/messages", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(chatMessagesTable)
      .orderBy(sql`${chatMessagesTable.timestamp} ASC`)
      .limit(100);
    res.json(rows.map((r) => ({ ...r, timestamp: r.timestamp.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to get messages");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/chat/messages", async (req, res) => {
  try {
    const parsed = SendChatMessageBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    await db.insert(chatMessagesTable).values({ role: "user", content: parsed.data.content });

    const aiContent = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)]!;
    const [aiRow] = await db
      .insert(chatMessagesTable)
      .values({ role: "assistant", content: aiContent })
      .returning();

    return res.json({ ...aiRow, timestamp: aiRow!.timestamp.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to send message");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
