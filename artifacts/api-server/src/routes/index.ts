import { Router, type Request, type Response } from "express";
import healthRouter from "./health";
import contactRouter from "./contact";

const router = Router();

router.use("/health", healthRouter);
router.use("/contact", contactRouter);

export default router;
