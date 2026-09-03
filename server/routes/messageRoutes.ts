import { Router } from "express";
import { sendMessage } from "../controllers/messageController";
import { moderateMessage } from "../middleware/moderation";
import { messageLimiter } from "../middleware/rateLimiters";
const router = Router();
router.post("/:username", messageLimiter, moderateMessage, sendMessage);
export default router;
