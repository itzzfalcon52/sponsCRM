import express from "express";
import { createOrg, joinOrg,getOrgMembers,removeOrgMember,updateMemberRoleController,updateOrgController, 
    leaveOrgController, 
    deleteOrgController, } from "../controllers/organisationController.js";
import { createOrganizationSchema } from "../models/organisationModule.js";
import { protect,restrictTo,validate } from "../middleware.js";

const router = express.Router();

router.use(protect);
router.post("/create",validate(createOrganizationSchema),createOrg);
router.post("/join",joinOrg);
router.get("/members",restrictTo("ADMIN","SENIOR"),getOrgMembers);
router.delete("/members/:memberId",restrictTo("ADMIN"),removeOrgMember);
router.patch("/members/:memberId/role", restrictTo("ADMIN"), updateMemberRoleController);

router.patch("/update",restrictTo("ADMIN"), updateOrgController);
router.post("/leave", leaveOrgController);
router.delete("/delete",restrictTo("ADMIN"), deleteOrgController);

export default router;
