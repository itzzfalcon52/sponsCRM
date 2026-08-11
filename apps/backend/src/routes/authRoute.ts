import express from "express";
import rateLimit from "express-rate-limit";

import {
  login,
  logout,
  register,
  me,
  updateProfile,
  changePassword,
  deleteMe,
} from "../controllers/authController.js";

import { protect } from "../middleware.js";

const router = express.Router();

// ============================================================
// AUTH RATE LIMITER
// ============================================================
//
// This limiter is specifically for authentication attempts.
// It should NOT apply to /me, /logout, etc.
//

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    status: "fail",
    message:
      "Too many authentication attempts. Please try again later.",
  },
});

// ============================================================
// PUBLIC AUTH ROUTES
// ============================================================

router.post("/register", authLimiter, register);

router.post("/login", authLimiter, login);

// ============================================================
// PROTECTED AUTH ROUTES
// ============================================================

router.post("/logout", logout);

router.use(protect);

router.get("/me", me);



router.patch("/update-me", updateProfile);

router.patch("/change-password", changePassword);

router.delete("/delete-me", deleteMe);

export default router;