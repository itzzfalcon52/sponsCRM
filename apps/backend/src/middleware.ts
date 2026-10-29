import {prisma} from "./lib/prisma.js"
import jwt from "jsonwebtoken";
import type { Response } from "express";
import type { User } from "../generated/prisma/client.js";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { healLegacyMembership, resolveActiveMembership } from "./models/sessionModule.js";


export const protect = async (req: any, res: Response, next: any) => {
    if (req.method === "OPTIONS") return next();
  
    let token;
  
    // 1. Extract token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }
  
    if (!token) {
      console.log("PROTECT: NO TOKEN");

     return res.status(401).json({
      status: "Unauthorized",
      message: "No authentication token",
     });
    }
  
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as {
        userId: string;
        role: string;
        orgId: string | null;
        purpose?: string;
      };

      // Session tokens carry no purpose. Short-lived tokens made for other
      // flows (like the Google connect state, which appears in URLs) must
      // never be accepted as a login.
      if (decoded.purpose) {
        return res.status(401).json({
          status: "Unauthorized",
          message: "Invalid token",
        });
      }

      

      
  
      // 2. Verify user still exists, and load the organization they have open.
      // Role and org come from the database on every request, so removing a
      // member or switching org takes effect immediately.
      const loadRow = () =>
        prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            orgId: true,
            role: true, // only read to repair legacy rows, see healLegacyMembership
            memberships: {
              select: { orgId: true, role: true },
              orderBy: { createdAt: "asc" },
            },
          },
        });

      let row = await loadRow();

      if (row && (await healLegacyMembership(row))) {
        row = await loadRow();
      }

      const active = row
        ? resolveActiveMembership(row.orgId, row.memberships)
        : null;

      const currentUser = row
        ? {
            id: row.id,
            orgId: active?.orgId ?? null,
            role: active?.role ?? ("MEMBER" as const),
          }
        : null;

            /*
      User logs in
        ↓
      JWT issued
       ↓
      Admin deletes that user
       ↓
      User still has old JWT
      */
  
      if (!currentUser) {
        return res.status(401).json({ status: "User no longer exists" });
      }
  
      // 3. Attach BOTH
      req.user = currentUser;
      req.auth = decoded;
  
      next();
    } catch (error:any) {
      console.error(
        "PROTECT JWT ERROR:",
        error.name,
        error.message
      );
    
      return res.status(401).json({
        status: "Unauthorized",
        message:
          error.name === "TokenExpiredError"
            ? "Token expired"
            : "Invalid token",
      });
    }
  };

export const restrictTo = (...roles: string[]) => {
    return (req: any, res: Response, next: any) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ status: "Forbidden" });
      }
      next();
    };
};


export const validate = (schema: any) => {   //ZOD MIDDLEWARE
    return (req: any, res: Response, next: any) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error: any) {
        return res.status(400).json({
          status: "fail",
          message: error.issues?.[0]?.message || "Invalid input",
        });
      }
    };
  };

  export const requireOrg = async (req: any, res: Response, next:any) => {
    if (!req.user?.orgId) {
      return res.status(403).json({
        status: "fail",
        message: "Join or create an organization first",
      });
    }

    
  
    const org = await prisma.organization.findUnique({
      where: { id: req.user.orgId },
      select: { id: true },
    });

    
  
    if (!org) {
      return res.status(403).json({
        status: "fail",
        message: "Organization no longer exists",
      });
    }
  
    next();
  };


  export const userRateLimiter = rateLimit({ 
    //We also add user-based rate limiting
    windowMs: 15 * 60 * 1000,
    max: 300,
  
    keyGenerator: (req: any) => {
      return req.user.id;
    }, //this is basically the key based on which the rate limiter works,the key we use is user id 
  
    standardHeaders: true,
    legacyHeaders: false,
  
    message: {
      status: "fail",
      message: "Too many requests. Please try again later.",
    },
  });