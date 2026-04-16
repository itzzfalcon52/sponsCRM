import express from "express";
import { login, logout,register,me,updateProfile,changePassword,deleteMe } from "../controllers/authController.js";
import { protect,restrictTo } from "../middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.use(protect);
router.get("/me", me);
router.post("/logout", logout);

router.patch('/update-me', protect, updateProfile);
router.patch('/change-password', protect, changePassword);
router.delete('/delete-me', protect, deleteMe);

export default router;