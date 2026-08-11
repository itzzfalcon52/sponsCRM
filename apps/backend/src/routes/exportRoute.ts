import express from "express";
import { connectGoogle, googleCallback, syncSheets } from "../controllers/exportCompaniesController.js";
import { protect,restrictTo,userRateLimiter} from "../middleware.js";

const router = express.Router();



// 1. Start OAuth
router.get("/connect", protect,userRateLimiter,restrictTo("ADMIN"), connectGoogle);

// 2. Google redirects here (NO protect )
router.get("/callback", googleCallback);

// 3. Sync data
router.post("/sync", protect ,userRateLimiter,restrictTo("ADMIN"), syncSheets);

export default router;
