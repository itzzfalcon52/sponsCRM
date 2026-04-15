import type { Request, Response } from "express";
import {
  createCompany,
  getCompanyById,
  listCompanies,
  updateCompany,
  deleteCompany,
  getMyCompanies,
  assignCompany
} from "../models/companyModule.js";
import { prisma } from "../lib/prisma.js";
import {
    bulkAssignCompanies,
    bulkAssignSchema,
  } from "../models/companyModule.js";

/* ================================
   CREATE COMPANY
================================ */

export const createCompanyController = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const orgId = req.user.orgId;

    console.log("REQ BODY:", req.body);

    if (!orgId) {
      return res.status(403).json({
        status: "fail",
        message: "Join or create an organization first",
      });
    }

    const company = await createCompany(userId, orgId, req.body);

    res.status(201).json({
      status: "success",
      data: { company },
    });
  } catch (error: any) {
    console.log("CREATE COMPANY ERROR:", error);
    if (error.code === "P2002") {
      return res.status(400).json({
        status: "fail",
        message: "Company already exists in this organization",
      });
    }
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
   
  }
};



/* ================================
   GET SINGLE COMPANY
================================ */

export const getCompanyController = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const orgId = req.user.orgId;

    const company = await getCompanyById(id, orgId);

    if (!company) {
      return res.status(404).json({
        status: "fail",
        message: "Company not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { company },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};



/* ================================
   LIST COMPANIES
================================ */

export const listCompaniesController = async (req: any, res: Response) => {
  try {
    const orgId = req.user.orgId;

    const result = await listCompanies(orgId, req.query)

    res.status(200).json({
        status: "success",
        results: result.companies.length,
        data: result.companies,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
        },
      });
  } catch (error: any) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};



/* ================================
   UPDATE COMPANY
================================ */

export const updateCompanyController = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const orgId = req.user.orgId;

    const result = await updateCompany(id, orgId, req.body);

    if (result.count === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Company not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Company updated",
    });
  } catch (error: any) {
     // Catch unique constraint violation on updates too
     if (error.code === "P2002") {
      return res.status(400).json({
        status: "fail",
        message: "Company already exists in this organization",
      });
    }
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};



/* ================================
   DELETE COMPANY (ADMIN)
================================ */

export const deleteCompanyController = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const orgId = req.user.orgId;

    const result = await deleteCompany(id, orgId);

    if (result.count === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Company not found",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};



/* ================================
   MY COMPANIES
================================ */

export const myCompaniesController = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const orgId = req.user.orgId;

    const result = await getMyCompanies(userId, orgId,req.query);
    const companies = result.companies;

    res.status(200).json({
      status: "success",
      results: companies.length,
      data:  companies ,
      pagination: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};



export const assignCompanyController = async (req: any, res: Response) => {
  try {
    const { id } = req.params; // companyId
    const { assignedToId } = req.body;
    const orgId = req.user.orgId;

    // ONLY validate the user if they are actually assigning it to someone (not unassigning)
    if (assignedToId) {
      const user = await prisma.user.findFirst({
        where:{
          id: assignedToId,
          orgId
        }
      });

      if (!user) {
        return res.status(400).json({
          status: "fail",
          message: "User not in organization",
        });
      }
    }

    const result = await assignCompany(id, orgId, assignedToId || null);

    return res.status(200).json({
      status: "success",
      message: assignedToId ? "Company assigned successfully" : "Company unassigned successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const bulkAssignController = async (req: any, res: Response) => {
  try {
    const orgId = req.user.orgId;

    // Validate input
    const { companyIds, assignedToId } = bulkAssignSchema.parse(req.body);

    //  No org → block
    if (!orgId) {
      return res.status(403).json({
        status: "fail",
        message: "You must belong to an organization",
      });
    }

    // ONLY validate the assigned user if we aren't unassigning
    if (assignedToId) {
      const user = await prisma.user.findFirst({
        where: {
          id: assignedToId,
          orgId,
        },
        select: { id: true },
      });
  
      if (!user) {
        return res.status(400).json({
          status: "fail",
          message: "User does not belong to your organization",
        });
      }
    }

    //  Bulk update
    const result = await bulkAssignCompanies(
      companyIds,
      orgId,
      assignedToId || null
    );

    return res.status(200).json({
      status: "success",
      updatedCount: result.count,
      message: assignedToId 
        ? `${result.count} companies assigned successfully`
        : `${result.count} companies unassigned successfully`,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};
