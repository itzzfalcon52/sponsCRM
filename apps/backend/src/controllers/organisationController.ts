import type { Role, User } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import type { Response } from "express";
import { createSendToken } from "./authController.js";
import { createOrganization, joinOrganization,getOrganizationMembers,removeOrganizationMember,updateMemberRole } from "../models/organisationModule.js";
import { sign } from "crypto";
import { create } from "domain";


export const createOrg=async (req: any, res: Response) => {
    try{
        const userId = req.user.id; //Auth Middleware sets req.user
        if (req.user.orgId) {
            return res.status(400).json({
              status: "User already in an organization",
            });
          }
        const { org, user } = await createOrganization(userId, req.body);
        createSendToken({ id: user.id, role: user.role, orgId: user.orgId }, 201, res,{

            org:{
                id: org.id,
                name: org.name,
                inviteCode: org.inviteCode,
                googleAccessToken: org.googleAccessToken,
                lastSyncedAt: org.lastSyncedAt,
               },
        });
      
    }catch(error: any){
        res.status(400).json({ status: "Something went wrong.Please try again", message: error.message });
    }
}

export const joinOrg=async (req: any, res: Response) => {
    const userId = req.user.id;
    const { inviteCode } = req.body as { inviteCode: string };
    if (req.user.orgId) {
        return res.status(400).json({
          status: "User already in an organization",
        });
      }
    try{
        const { org, user } = await joinOrganization(userId, inviteCode);
        createSendToken({ id: user.id, role: user.role, orgId: user.orgId }, 200, res,{ org });
       
    }catch(error: any){
        res.status(400).json({ status: "Something went wrong.Please try again", message: error.message });
    }

};

export const getOrgMembers = async (req: any, res: Response) => {
    try {
        const orgId = req.user.orgId;

        if (!orgId) {
            return res.status(403).json({
                status: "fail",
                message: "User is not part of an organization.",
            });
        }

        const members = await getOrganizationMembers(orgId);

        res.status(200).json({
            status: "success",
            results: members.length,
            data: {
                members,
            },
        });
    } catch (error: any) {
        res.status(500).json({ 
            status: "error", 
            message: "Failed to fetch organization members.", 
            error: error.message 
        });
    }
};

export const removeOrgMember = async (req: any, res: Response) => {
    try {
        const orgId = req.user.orgId;
        const adminId = req.user.id;
        const { memberId } = req.params; // Assuming the ID is passed in the URL (e.g., /org/members/:memberId)

        if (!orgId) {
            return res.status(403).json({
                status: "fail",
                message: "User is not part of an organization.",
            });
        }

        // Must be an admin to remove
        if (req.user.role !== "ADMIN") {
            return res.status(403).json({
                status: "fail",
                message: "Not authorized. Only Admins can remove members.",
            });
        }

        // Prevent self-removal
        if (adminId === memberId) {
            return res.status(400).json({
                status: "fail",
                message: "Admins cannot remove themselves.",
            });
        }

        await removeOrganizationMember(memberId, orgId);

        res.status(200).json({
            status: "success",
            message: "Member removed successfully",
        });
    } catch (error: any) {
        res.status(400).json({ 
            status: "error", 
            message: error.message 
        });
    }
};

export const updateMemberRoleController = async (req: any, res: Response) => {
    try {
        const orgId = req.user.orgId;
        const adminId = req.user.id;
        const { memberId } = req.params;
        const { role } = req.body; 

        if (!orgId) {
            return res.status(403).json({ status: "fail", message: "User is not part of an organization." });
        }

        if (adminId === memberId) {
            return res.status(400).json({ status: "fail", message: "Admins cannot change their own role here." });
        }

        // Validate role input
        if (!["ADMIN", "SENIOR", "MEMBER"].includes(role)) {
            return res.status(400).json({ status: "fail", message: "Invalid role specified." });
        }

        await updateMemberRole(memberId, orgId, role);

        res.status(200).json({
            status: "success",
            message: `Member role updated to ${role}`,
        });
    } catch (error: any) {
        res.status(400).json({ 
            status: "error", 
            message: error.message 
        });
    }
};

