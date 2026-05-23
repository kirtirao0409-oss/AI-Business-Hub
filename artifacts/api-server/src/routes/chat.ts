import { Router } from "express";
import Groq from "groq-sdk";

const router = Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT =
  "You are an AI business assistant for Mission Control dashboard. You help with CRM, HR, project management, leads, and business analytics. Be concise and professional.";

type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

router.post("/", async (req, res) => {
  const { content, history } = req.body as {
    content?: string;
    history?: HistoryMessage[];
  };

  if (!content || typeof content !== "string" || !content.trim()) {
    return res.status(400).json({ error: "content is required" });
  }

  req.log.info({ content }, "chat message received");

  const safeHistory: Groq.Chat.ChatCompletionMessageParam[] = Array.isArray(history)
    ? history
        .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content }))
    : [];

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...safeHistory,
        { role: "user", content: content.trim() },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content ?? "No response from AI.";

    return res.json({
      id: Date.now().toString(),
      role: "assistant",
      content: reply,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Groq API call failed");
    return res.status(500).json({ error: "AI request failed" });
  }
});

export default router;
