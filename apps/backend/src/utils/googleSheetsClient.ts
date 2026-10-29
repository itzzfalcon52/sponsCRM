import { google } from "googleapis";
import { prisma } from "../lib/prisma.js";
import { getOAuthClient } from "./google.js";
import { decryptSecret } from "./secretBox.js";

export class GoogleImportError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

export type SheetsSource = "user" | "org";

/**
 * Sheets API client for reading a sheet on someone's behalf. Prefers the
 * person's own Google connection (read-only, set up by themselves); falls
 * back to the organization's connection (set up by an admin for Sync) so
 * existing setups keep working. `source` says which one was used.
 */
export const getSheetsClientFor = async (userId: string, orgId: string) => {
  const [user, org] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { googleSheetsToken: true },
    }),
    prisma.organization.findUnique({
      where: { id: orgId },
      select: { googleAccessToken: true, googleRefreshToken: true },
    }),
  ]);

  const auth = getOAuthClient();
  let source: SheetsSource;

  if (user?.googleSheetsToken) {
    let refreshToken: string;
    try {
      refreshToken = decryptSecret(user.googleSheetsToken);
    } catch {
      // Unreadable (for example JWT_SECRET changed): drop it and ask to reconnect.
      await clearUserGoogleToken(userId);
      throw new GoogleImportError(
        401,
        "GOOGLE_RECONNECT_REQUIRED",
        "Your Google connection needs to be set up again. Connect your Google account and try again."
      );
    }
    // Only the refresh token is stored; the client fetches access tokens itself.
    auth.setCredentials({ refresh_token: refreshToken });
    source = "user";
  } else if (org?.googleRefreshToken) {
    auth.setCredentials({
      access_token: org.googleAccessToken,
      refresh_token: org.googleRefreshToken,
    });
    source = "org";
  } else {
    throw new GoogleImportError(
      409,
      "GOOGLE_NOT_CONNECTED",
      "Connect your Google account to import from a link, or upload the sheet as an Excel/CSV file."
    );
  }

  return { sheets: google.sheets({ version: "v4", auth }), source };
};

export const clearUserGoogleToken = (userId: string) =>
  prisma.user.update({
    where: { id: userId },
    data: { googleSheetsToken: null, googleSheetsConnectedAt: null },
  });
