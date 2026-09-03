import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { createOrder, verifyPayment, getPremiumHint } from "../controllers/paymentController";

const router = Router();

router.post("/create-order", requireAuth, createOrder);
router.post("/verify", requireAuth, verifyPayment);
router.get("/hint/:messageId", requireAuth, getPremiumHint);

export default router;
