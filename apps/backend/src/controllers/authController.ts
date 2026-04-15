import jwt, { type SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { registerUser, loginUser } from "../models/authModule";
import type { Response } from "express";
import type { CookieOptions } from "express";
import type { Role, User } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { nextTick } from "process";

type JwtPayload = {
    id: string;
    role: Role;
    orgId: string | null;
  };

export const signToken = (user: JwtPayload) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN;

  if (!secret) throw new Error("JWT_SECRET is not set");
  if (!expiresIn) throw new Error("JWT_EXPIRES_IN is not set");

  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"], // now it's guaranteed string
  };

  return jwt.sign(
    { userId: user.id, role: user.role, orgId: user.orgId },
    secret,
    options
  );
};

export const createSendToken = (
  user: JwtPayload,
  statusCode: number,
  res: Response,
  extraData?:any
) => {
  // Create JWT token
  const token = signToken({ id: user.id, role: user.role, orgId: user.orgId });

  const cookieOptions: CookieOptions = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, //so that cookie cannot be modified by browser
  };

  // Secure cookie only in production (HTTPS only)
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  // Attach JWT as cookie
  res.cookie("jwt", token, cookieOptions);

  // Send response
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
      ...extraData,
    },
  });
};

export const register = async (req: any, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await registerUser({ email, password,name:req.body.name });
    createSendToken(user, 201, res);
  } catch (error: any) {
    res.status(400).json({ status: "Something went wrong.Please try again", message: error.message });

  }
};

export const login = async (req: any, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await loginUser({email, password});
    createSendToken(user, 200, res);
  } catch (error: any) {
    res.status(400).json({ status: "Something went wrong.Please try again", message: error.message });
  }
}

export const me = async (req: any, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ status: "Unauthorized" });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        organization: true, 
      },
    });

    if (!dbUser) {
      return res.status(401).json({ status: "Unauthorized" });
    }

    //  sanitize response 
    const user = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      organization: dbUser.organization
      ? {
      id: dbUser.organization.id,
      name: dbUser.organization.name,
      inviteCode: dbUser.organization.inviteCode,
      googleAccessToken: dbUser.organization.googleAccessToken,
      lastSyncedAt: dbUser.organization.lastSyncedAt,
      }
       : null,
    };

    console.log("Authenticated user:", user);

    return res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const logout = async (_: unknown, res: Response) => {
  try {
    // Clear cookie by setting it to a dummy value immediately expiring
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({ status: "success" });
  } catch (error: any) {
    return res.status(500).json({
      status: "Something went wrong.Please try again",
      message: error.message,
    });
  }
};
  