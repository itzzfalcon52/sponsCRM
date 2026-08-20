// routes/dashboardRoutes.ts

import express from "express";

import {
  getAdminDashboardStats,
} from "../controllers/dashboardController.js";

import {
  protect,
  requireOrg,
  restrictTo,
} from "../middleware.js";

const router = express.Router();

router.get(
  "/stats",
  protect,
  requireOrg,
  restrictTo("ADMIN","SENIOR"),
  getAdminDashboardStats
);

export default router;