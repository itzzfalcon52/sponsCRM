import express from "express";
import { connectGoogle, connectGoogleForImport, disconnectGoogleForImport, googleCallback, syncSheets } from "../controllers/exportCompaniesController.js";
import { protect,restrictTo,userRateLimiter} from "../middleware.js";

const router = express.Router();



// 1. Start OAuth
router.get("/connect", protect,userRateLimiter,restrictTo("ADMIN"), connectGoogle);

// 1b. Any member can connect their OWN Google account (read-only) to import
// from sheet links. Separate from the admin-only organization connection above.
router.get("/connect-import", protect, userRateLimiter, connectGoogleForImport);
router.delete("/connect-import", protect, userRateLimiter, disconnectGoogleForImport);

// 2. Google redirects here (NO protect )
router.get("/callback", googleCallback);

// 3. Sync data
router.post("/sync", protect ,userRateLimiter,restrictTo("ADMIN"), syncSheets);

export default router;
