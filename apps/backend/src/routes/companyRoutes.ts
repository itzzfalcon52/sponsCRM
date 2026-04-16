import express from "express";
import {
  createCompanyController,
  getCompanyController,
  listCompaniesController,
  updateCompanyController,
  deleteCompanyController,
  myCompaniesController,
  assignCompanyController,
  bulkAssignController,
  searchDuplicatesController
} from "../controllers/companyController.js";

import {
  protect,
  restrictTo,
  requireOrg,
  validate,
} from "../middleware.js";

import {
  createCompanySchema,
  updateCompanySchema,
} from "../models/companyModule.js";

const router = express.Router();

/* ================================
   GLOBAL MIDDLEWARE
================================ */

router.use(protect);
router.use(requireOrg);

/* ================================
   CORE ROUTES
================================ */

router.post(
  "/",
  
  createCompanyController
);

router.get("/me", myCompaniesController);


router.get("/", listCompaniesController);


/* ================================
   BULK ASSIGNMENT
================================ */

router.patch(
  "/bulk-assign",
  restrictTo("ADMIN", "SENIOR"),
  bulkAssignController
);

/* ================================
   SINGLE COMPANY
================================ */

router.get("/:id", getCompanyController);

router.patch(
  "/:id",
  validate(updateCompanySchema),
  updateCompanyController
);

/* ================================
   ASSIGNMENT
================================ */

router.patch(
  "/:id/assign",
  restrictTo("ADMIN", "SENIOR"),
  assignCompanyController
);

/* ================================
   DELETE
================================ */

router.delete(
  "/:id",
  restrictTo("ADMIN"),
  deleteCompanyController
);


router.get("/search/duplicates", protect, searchDuplicatesController);

export default router;