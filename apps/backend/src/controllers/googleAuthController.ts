import type { Request, Response } from "express";
import z from "zod";
import { Prisma } from "../../generated/prisma/client.js";
import { googleLoginSchema, findOrCreateGoogleUser } from "../models/googleAuthModule.js";
import { GoogleSignInError, verifyGoogleCredential } from "../utils/googleSignIn.js";
import { createSendToken } from "./authController.js";

export async function googleLogin(req: Request, res: Response) {
  res.set("Cache-Control", "no-store");
  // Only our JSON callback is supported; reject cross-site HTML form submissions.
  if (!req.is("application/json")) {
    return res.status(415).json({ status: "fail", message: "Use application/json." });
  }
  try {
    const { credential, currentPassword } = googleLoginSchema.parse(req.body);
    const identity = await verifyGoogleCredential(credential);
    const user = await findOrCreateGoogleUser(identity, currentPassword);
    createSendToken(user, 200, res);
  } catch (error) {
    if (error instanceof GoogleSignInError) {
      return res.status(error.statusCode).json({
        status: "fail", message: error.message, code: error.code,
        ...(error.email ? { email: error.email } : {}),
      });
    }
    if (error instanceof z.ZodError) {
      return res.status(400).json({ status: "fail", message: "Invalid Google sign-in request." });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(409).json({ status: "fail", message: "An account was just created or linked. Please try signing in again." });
    }
    console.error("Google sign-in failed", error instanceof Error ? error.name : "Unknown error");
    return res.status(500).json({ status: "error", message: "Unable to sign in right now. Please try again later." });
  }
}
