import { getMyNotifications } from "../models/notificationModule.js";
import { prisma } from "../lib/prisma.js";

export const getNotifications = async (req:any, res:any) => {
    try {
        const userId = req.user.id;
        const notifications = await getMyNotifications(userId);

        res.status(200).json({
            status: "success",
            results: notifications.length,
            data: notifications,
        });
    } catch (error:any) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

export const markAsRead = async (req:any, res:any) => {
    try {
        const { id } = req.params; // To mark a specific notif as read
        const userId = req.user.id;

        await prisma.notification.updateMany({
            where: {
                id,
                userId, // Security: Ensure user owns the notif
            },
            data: { isRead: true },
        });

        res.status(200).json({ status: "success", message: "Marked as read" });
    } catch (error:any) {
        res.status(400).json({ status: "error", message: error.message });
    }
};

export const markAllAsRead = async (req:any, res:any) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user.id, isRead: false },
            data: { isRead: true },
        });

        res.status(200).json({ status: "success", message: "All marked as read" });
    } catch (error:any) {
        res.status(400).json({ status: "error", message: error.message });
    }
};