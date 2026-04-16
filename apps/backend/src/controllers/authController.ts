import jwt, { type SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { 
  registerUser, 
  loginUser, 
  updateUserDetails, 
  updateUserPassword, 
  deleteUserAccount 
} from "../models/authModule.js";
import type { Response } from "express";
import type { CookieOptions } from "express";
import { Role } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

type JwtPayload = {
    id: string;
    role: Role;
    orgId: string | null;
};

/**
 * UTILS: TOKEN & COOKIE MANAGEMENT
 */
export const signToken = (user: JwtPayload) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN;

  if (!secret || !expiresIn) throw new Error("JWT environment variables not set");

  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(
    { userId: user.id, role: user.role, orgId: user.orgId },
    secret,
    options
  );
};

export const createSendToken = (
  user: any,
  statusCode: number,
  res: Response,
  extraData?: any
) => {
  const token = signToken({ 
    id: user.id, 
    role: user.role, 
    orgId: user.organization?.id || user.orgId || null 
  });

  const cookieOptions: CookieOptions = {
    expires: new Date(
      Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  res.cookie("jwt", token, cookieOptions);

  // SANITIZE USER DATA BEFORE SENDING
  res.status(statusCode).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization || null,
      },
      ...extraData,
    },
  });
};

/**
 * AUTHENTICATION CONTROLLERS
 */
export const register = async (req: any, res: Response) => {
  try {
    const { email, password, name } = req.body;
    const user = await registerUser({ email, password, name });
    createSendToken(user, 201, res);
  } catch (error: any) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

export const login = async (req: any, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await loginUser({ email, password });
    createSendToken(user, 200, res);
  } catch (error: any) {
    res.status(400).json({ status: "fail", message: error.message });
  }
};

export const me = async (req: any, res: Response) => {
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { organization: true },
    });

    if (!dbUser) return res.status(401).json({ status: "fail", message: "User not found" });

    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          organization: dbUser.organization || null,
        }
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const logout = async (_: any, res: Response) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.status(200).json({ status: "success" });
};

/**
 * USER PROFILE & ACCOUNT MANAGEMENT
 */
export const updateProfile = async (req: any, res: Response) => {
  try {
    const dbUser = await updateUserDetails(req.user.id, req.body);
    
    // Explicitly send back sanitized user to update Zustand store
    res.status(200).json({ 
      status: "success", 
      data: { 
        user: {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
        } 
      } 
    });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const changePassword = async (req: any, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Logic inside model: Check current password -> Hash new one -> Update
    await updateUserPassword(req.user.id, currentPassword, newPassword);

    // SECURITY: Clear cookie to force re-login with new password
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({ 
      status: "success", 
      message: "Password updated. Please log in again." 
    });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const deleteMe = async (req: any, res: Response) => {
  try {
    await deleteUserAccount(req.user.id);
    
    // Clear session cookie
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(204).json({ status: "success", data: null });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};