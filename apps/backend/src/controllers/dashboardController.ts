import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const STATUS_PROBABILITY: Record<string, number> = {
  NOT_CONTACTED: 0.05,
  CONTACTED: 0.15,
  IN_TALKS: 0.35,
  NEGOTIATING: 0.60,
  POSITIVE: 0.85,
  CLOSED: 1.0,
  REJECTED: 0,
};

export const getAdminDashboardStats = async (
  req: any,
  res: Response
) => {
  try {
    // Your Prisma schema uses orgId.
    // Do NOT use req.user.organizationId.
    const organizationId = req.user?.orgId;

    if (!organizationId) {
      return res.status(403).json({
        status: "fail",
        message: "Organization not found.",
      });
    }

    const companies = await prisma.company.findMany({
      where: {
        orgId: organizationId,
      },
      select: {
        status: true,
        type: true,
        amount: true,
        assignedToId: true,
      },
    });

    const total = companies.length;

    const statusCounts = {
      NOT_CONTACTED: 0,
      CONTACTED: 0,
      IN_TALKS: 0,
      NEGOTIATING: 0,
      POSITIVE: 0,
      CLOSED: 0,
      REJECTED: 0,
    };

    let totalCash = 0;
    let totalInKind = 0;
    let weightedPipeline = 0;

    const assignedCounts: Record<string, number> = {};

    for (const company of companies) {
      // -----------------------------
      // STATUS COUNTS
      // -----------------------------

      if (company.status in statusCounts) {
        statusCounts[
          company.status as keyof typeof statusCounts
        ]++;
      }

      // -----------------------------
      // CLOSED REVENUE
      // -----------------------------

      if (company.status === "CLOSED") {
        if (company.type === "CASH") {
          totalCash += company.amount || 0;
        }

        if (company.type === "IN_KIND") {
          totalInKind += company.amount || 0;
        }
      }

      // -----------------------------
      // WEIGHTED PIPELINE
      // -----------------------------

      if (company.type === "CASH") {
        const probability =
          STATUS_PROBABILITY[company.status] || 0;

        weightedPipeline +=
          (company.amount || 0) * probability;
      }

      // -----------------------------
      // TEAM WORKLOAD
      // -----------------------------

      if (company.assignedToId) {
        assignedCounts[company.assignedToId] =
          (assignedCounts[company.assignedToId] || 0) + 1;
      }
    }

    return res.json({
      total,

      statuses: statusCounts,

      revenue: {
        totalCash,
        totalInKind,
        weightedPipeline,
      },

      assignedCounts,
    });
  } catch (error) {
    console.error(
      "Failed to fetch dashboard stats:",
      error
    );

    return res.status(500).json({
      status: "error",
      message: "Failed to fetch dashboard statistics.",
    });
  }
};