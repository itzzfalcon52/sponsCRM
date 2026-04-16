import {prisma} from "../lib/prisma.js"



export const createNotification = async (userId:string, orgId:string, title:string, message:string, type:any, link:any) => {
    return prisma.notification.create({
      data: { userId, orgId, title, message, type, link },
    });
  };
  
  export const getMyNotifications = async (userId:string ) => {
    return prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: "desc" },
      take: 10
    });
  };