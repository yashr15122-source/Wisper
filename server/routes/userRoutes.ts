import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { me, publicProfile, updateProfile, inbox, markOpened, toggleFavorite, deleteMessage, adminGetUserMessages, adminGetAllUsers } from "../controllers/userController";
const router = Router();
router.get("/me", requireAuth, me);
router.get("/public/:username", publicProfile);
router.patch("/profile", requireAuth, updateProfile);
router.get("/messages", requireAuth, inbox);
router.patch("/messages/:id/open", requireAuth, markOpened);
router.patch("/messages/:id/favorite", requireAuth, toggleFavorite);
router.delete("/messages/:id", requireAuth, deleteMessage);

// Admin routes
router.get("/admin/users", requireAuth, requireAdmin, adminGetAllUsers);
router.get("/admin/users/:userId/messages", requireAuth, requireAdmin, adminGetUserMessages);
export default router;
