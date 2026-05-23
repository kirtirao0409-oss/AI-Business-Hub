import { Router } from "express";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { content } = req.body;

    console.log("MESSAGE RECEIVED:", content);

    return res.json({
      id: Date.now().toString(),
      role: "assistant",
      content: `AI reply working: ${content}`,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "AI request failed",
    });
  }
});

export default router;
