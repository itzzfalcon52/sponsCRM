import express from "express";
import { getNotifications, markAsRead, markAllAsRead } from "../controllers/notificationController.js";
import { protect,userRateLimiter } from "../middleware.js";

const router = express.Router();

// All notification routes require a logged-in user
router.use(protect);
router.use(userRateLimiter);

router.get("/", getNotifications);
router.patch("/mark-all", markAllAsRead);
router.patch("/:id/read", markAsRead);

export default router;