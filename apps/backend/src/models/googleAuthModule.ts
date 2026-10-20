import bcrypt from "bcrypt";
import z from "zod";
import { prisma } from "../lib/prisma.js";
import { GoogleSignInError } from "../utils/googleSignIn.js";

export const googleLoginSchema = z.object({
  credential: z.string().min(1).max(8192),
  currentPassword: z.string().min(6).max(1024).optional(),
});

type GoogleIdentity = { googleId: string; email: string; name?: string };

export async function findOrCreateGoogleUser(identity: GoogleIdentity, currentPassword?: string) {
  // Google's immutable subject, rather than a mutable email, identifies linked accounts.
  const linked = await prisma.user.findUnique({
    where: { googleId: identity.googleId }, include: { organization: true },
  });
  if (linked) return linked;

  const matches = await prisma.user.findMany({
    where: { email: { equals: identity.email, mode: "insensitive" } },
    include: { organization: true }, take: 2,
  });
  if (matches.length > 1) {
    throw new GoogleSignInError("More than one account matches this email. Please use your existing password login.", 409);
  }

  const existing = matches[0];
  if (existing) {
    if (existing.googleId || !existing.password) {
      throw new GoogleSignInError("This CRM account cannot be linked to this Google account. Please use your existing sign-in method.", 409);
    }
    // Legacy signup did not verify email ownership. Never merge on email alone.
    if (!currentPassword) {
      throw new GoogleSignInError(
        "Confirm your existing CRM password once to connect Google to your account.",
        409, "GOOGLE_LINK_REQUIRED", existing.email,
      );
    }
    if (!await bcrypt.compare(currentPassword, existing.password)) {
      throw new GoogleSignInError("Incorrect CRM password. Your account has not been changed.", 401, "GOOGLE_LINK_PASSWORD_INVALID");
    }
    // Compare-and-set prevents concurrent linking or password changes from overwriting an identity.
    const result = await prisma.user.updateMany({
      where: { id: existing.id, googleId: null, password: existing.password },
      data: { googleId: identity.googleId },
    });
    if (result.count !== 1) {
      throw new GoogleSignInError("Your account changed while linking. Please start Google sign-in again.", 409);
    }
    const user = await prisma.user.findUnique({ where: { id: existing.id }, include: { organization: true } });
    if (!user) throw new GoogleSignInError("Account no longer exists.");
    return user;
  }

  // Only brand-new users get a new ID. Existing account data is never recreated.
  return prisma.user.create({
    data: {
      email: identity.email, googleId: identity.googleId,
      name: identity.name?.trim().slice(0, 50) || identity.email.split("@")[0],
      password: null,
    },
    include: { organization: true },
  });
}
