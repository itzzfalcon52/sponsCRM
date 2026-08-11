import express from "express";
import {
  createActivityController,
  getCompanyActivitiesController,
  getAllActivitiesController,
  getFollowUpsSummaryController
} from "../controllers/activityController.js";

import { protect, requireOrg,restrictTo,userRateLimiter } from "../middleware.js";

const router = express.Router();

router.use(protect);
router.use(userRateLimiter);
router.use(requireOrg);

// Create activity
router.post("/", createActivityController);

// Get timeline for a company
router.get("/company/:companyId", getCompanyActivitiesController);

// Get all activities (for admin)
router.get("/all", getAllActivitiesController);

// Get follow-ups summary
router.get("/followups", getFollowUpsSummaryController);

export default router;