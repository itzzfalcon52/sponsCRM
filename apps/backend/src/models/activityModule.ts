import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import type { ActivityType, Status } from "../../generated/prisma/client.js";
import { createNotification } from "./notificationModule.js";

/**
 * VALIDATION SCHEMA
 */
export const createActivitySchema = z.object({
  companyId: z.string().uuid(),
  type: z.enum(["CALL", "EMAIL", "MEETING"]),
  note: z.string().max(500).optional(),
  nextFollowUp: z.string().optional(),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;

/**
 * SMART FOLLOW-UP GENERATOR
 */
const getNextFollowUp = (type: ActivityType): Date => {
  const now = Date.now();

  switch (type) {
    case "CALL":
      return new Date(now + 1 * 24 * 60 * 60 * 1000); // +1 day
    case "EMAIL":
      return new Date(now + 2 * 24 * 60 * 60 * 1000); // +2 days
    case "MEETING":
      return new Date(now + 3 * 24 * 60 * 60 * 1000); // +3 days
    default:
      return new Date(now + 2 * 24 * 60 * 60 * 1000);
  }
};

/**
 * CREATE ACTIVITY 
 */
export const createActivity = async (
  userId: string,
  orgId: string,
  userRole: string,
  input: CreateActivityInput
) => {
  const data = createActivitySchema.parse(input);
  const normalizeDate = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const activity = await prisma.$transaction(async (tx) => {
    /**
     * Fetch company AND user name WITHIN transaction 
     */
    const [company, currentUser] = await Promise.all([
      tx.company.findFirst({
        where: { id: data.companyId, orgId },
        select: {
          id: true,
          name: true,
          assignedToId: true,
          createdById: true,
          status: true,
        },
      }),
      tx.user.findUnique({
        where: { id: userId },
        select: { name: true }
      })
    ]);

    if (!company) {
      throw new Error("Company not found in your organization");
    }

    /**
     * ROLE-BASED ACCESS CONTROL
     */
    if (userRole === "MEMBER") {
      if (
        company.assignedToId !== userId &&
        company.createdById !== userId
      ) {
        throw new Error("Not authorized to log activity for this company");
      }
    }

    /**
     * Create activity
     */
    const newActivity = await tx.activity.create({
      data: {
        type: data.type,
        note: data.note,
        companyId: data.companyId,
        userId,
      },
    });

    /**
     * Update company automatically
     */
    const updatedCompany = await tx.company.update({
      where: { id: data.companyId },
      data: {
        lastContactedAt: new Date(),
        nextFollowUp: data.nextFollowUp
         ? normalizeDate(new Date(data.nextFollowUp))
         : normalizeDate(getNextFollowUp(data.type)),
       
        status:
          company.status === "NOT_CONTACTED"
            ? ("CONTACTED" as Status)
            : company.status,
      },
    });

    /**
     * NOTIFICATION LOGIC: Notify Admins if a high-value status is reached
     */
    if (["POSITIVE", "CLOSED"].includes(updatedCompany.status as string)) {
      // Find the Admin of the Org
      const admin = await tx.user.findFirst({
        where: { orgId, role: "ADMIN" },
        select: { id: true }
      });

      if (admin) {
        await createNotification(
          admin.id,
          orgId,
          "Milestone Reached! 🚀",
          `${currentUser?.name || "A member"} moved ${updatedCompany.name} to ${updatedCompany.status}.`,
          "SYSTEM",
          `/dashboard/companies/${updatedCompany.id}`
        );
      }
    }

    return newActivity;
  });

  return activity; // Fixed: using correctly scoped variable name
};

/**
 * GET ACTIVITIES FOR A COMPANY (TIMELINE)
 */
export const getActivitiesByCompany = async (
  companyId: string,
  orgId: string
) => {
  return prisma.activity.findMany({
    where: {
      companyId,
      company: { orgId },
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getAllActivities = async (req: any, res: any) => {
  const orgId = req.user.orgId;
  const role = req.user.role;
  const userId = req.user.id;

  const whereClause: any = {
    company: { orgId },
  };

  if (role === "MEMBER") {
    whereClause.userId = userId;
  }

  return prisma.activity.findMany({
    where: whereClause,
    include: {
      user: true,
      company: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
};

export const getFollowUps = async (req: any) => {
  const orgId = req.user.orgId;
  const role = req.user.role;
  const userId = req.user.id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const whereCondition = role === "MEMBER" ? { assignedToId: userId } : {};

  const overdue = await prisma.company.findMany({
    where: {
      orgId,
      nextFollowUp: { lt: today },
      ...whereCondition,
    },
    include: { assignedTo: true },
  });

  const todayFollowUps = await prisma.company.findMany({
    where: {
      orgId,
      nextFollowUp: { gte: today, lt: tomorrow },
      ...whereCondition,
    },
    include: { assignedTo: true },
  });

  return { overdue, today: todayFollowUps };
};