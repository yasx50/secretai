import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { listChats, sendMessage } from "../controllers/secret.chat.js";

const router = Router();

router.use(requireAuth());
router.get("/", listChats);
router.post("/message", sendMessage);

export default router;
