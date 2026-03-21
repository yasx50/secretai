import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { syncClerkUser } from "../controllers/auth.controller.js";

const router = Router();

router.use(requireAuth());
router.post("/sync-clerk", syncClerkUser);

export default router;
