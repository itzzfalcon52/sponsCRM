import express from "express";
import { connectGoogle, googleCallback, syncSheets } from "../controllers/exportCompaniesController.js";
import { protect,restrictTo} from "../middleware.js";

const router = express.Router();

// 1. Start OAuth
router.get("/connect", protect,restrictTo("ADMIN"), connectGoogle);

// 2. Google redirects here (NO protect )
router.get("/callback",restrictTo("ADMIN"), googleCallback);

// 3. Sync data
router.post("/sync", protect ,restrictTo("ADMIN"), syncSheets);

export default router;