import { Router, type Request, type Response } from "express";

const router = Router();

// Notice the : Request and : Response tags below - those are what Vercel wants!
router.get("/", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
