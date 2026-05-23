import { Router, type IRouter } from "express";
import healthRouter from "./health";
import analyticsRouter from "./analytics";
import leadsRouter from "./leads";
import candidatesRouter from "./candidates";
import projectsRouter from "./projects";
import tasksRouter from "./tasks";
import chatRouter from "./chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(analyticsRouter);
router.use(leadsRouter);
router.use(candidatesRouter);
router.use(projectsRouter);
router.use(tasksRouter);
router.use("/chat", chatRouter);

export default router;
