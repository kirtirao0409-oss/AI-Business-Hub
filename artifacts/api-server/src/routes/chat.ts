import { Router } from "express";
import Groq from "groq-sdk";

const router = Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT =
  "You are an AI business assistant for Mission Control dashboard. You help with CRM, HR, project management, leads, and business analytics. Be concise and professional.";

router.post("/", async (req, res) => {
  const { content } = req.body as { content?: string };

  if (!content || typeof content !== "string" || !content.trim()) {
    return res.status(400).json({ error: "content is required" });
  }

  req.log.info({ content }, "chat message received");

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
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
