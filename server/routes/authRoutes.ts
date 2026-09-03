import { Router } from "express";
import { login, register, logout } from "../controllers/authController";
import { authLimiter } from "../middleware/rateLimiters";
const router = Router();
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
export default router;
