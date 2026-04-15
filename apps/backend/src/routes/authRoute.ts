import express from "express";
import { login, logout,register,me } from "../controllers/authController.js";
import { protect,restrictTo } from "../middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.use(protect);
router.get("/me", me);
router.post("/logout", logout);

export default router;