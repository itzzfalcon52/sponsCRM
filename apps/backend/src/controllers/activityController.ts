import { createActivity, getActivitiesByCompany,getAllActivities,getFollowUps } from "../models/activityModule";
import type { Response } from "express";
import type { CreateActivityInput } from "../models/activityModule";

export const createActivityController = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const orgId = req.user.orgId;

    const input = req.body as CreateActivityInput;
    const activity = await createActivity(
      userId,
      orgId,
      req.user.role,
      input
    );

    return res.status(201).json({
      status: "success",
      data: { activity },
    });
  } catch (error: any) {
    return res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const getCompanyActivitiesController = async (
    req: any,
    res: Response
  ) => {
    try {
      const { companyId } = req.params;
      const orgId = req.user.orgId;
  
      const activities = await getActivitiesByCompany(companyId, orgId);
  
      return res.status(200).json({
        status: "success",
        results: activities.length,
        data: { activities },
      });
    } catch (error: any) {
      return res.status(400).json({
        status: "fail",
        message: error.message,
      });
    }
  };

export const getAllActivitiesController = async (req:any, res:Response) => {
    try {
        const activities = await getAllActivities(req,res);
        return res.status(200).json({
            status:"success",
            results:activities.length,
            data:{activities}
        })
    } catch (error:any) {
        return res.status(400).json({
            status:"fail",
            message:error.message
        })
    }

}


export const getFollowUpsSummaryController = async (req: any, res: Response) => {
  try {
    const followUps = await getFollowUps(req);

    return res.status(200).json({
      status: "success",
      data: {
        overdue: followUps.overdue,
        today: followUps.today,
      },
    });
  } catch (error: any) {
    return res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};