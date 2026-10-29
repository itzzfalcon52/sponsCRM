import {prisma} from "../lib/prisma.js"



export const createNotification = async (userId:string, orgId:string, title:string, message:string, type:any, link:any) => {
    return prisma.notification.create({
      data: { userId, orgId, title, message, type, link },
    });
  };
  
  // Only the organization the user currently has open: alerts from their
  // other organizations are not mixed in.
  export const getMyNotifications = async (userId:string, orgId:string | null) => {
    if (!orgId) return [];

    return prisma.notification.findMany({
      where: { userId, orgId, isRead: false },
      orderBy: { createdAt: "desc" },
      take: 10
    });
  };