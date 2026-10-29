import { google } from "googleapis";
import { prisma } from "../lib/prisma.js";
import { getOAuthClient } from "./google.js";

export class GoogleImportError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

/** Sheets API client authenticated as the org's connected Google account. */
export const getOrgSheetsClient = async (orgId: string) => {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { googleAccessToken: true, googleRefreshToken: true },
  });

  if (!org?.googleRefreshToken) {
    throw new GoogleImportError(
      409,
      "GOOGLE_NOT_CONNECTED",
      "Google is not connected for this organization. Ask an admin to connect Google, or upload the sheet as an Excel/CSV file."
    );
  }

  const auth = getOAuthClient();
  auth.setCredentials({
    access_token: org.googleAccessToken,
    refresh_token: org.googleRefreshToken,
  });

  return google.sheets({ version: "v4", auth });
};
