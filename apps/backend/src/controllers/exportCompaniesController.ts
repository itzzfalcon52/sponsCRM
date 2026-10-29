import { google } from "googleapis";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { getOAuthClient } from "../utils/google.js";
import { encryptSecret } from "../utils/secretBox.js";
import { loadSessionUser } from "../models/sessionModule.js";
import { sanitizeUser } from "./authController.js";
import type { Prisma, Domain } from "../../generated/prisma/client.js";

/* ============================================================
   GOOGLE AUTH ERROR DETECTION
============================================================ */

const isGoogleAuthError = (err: any) => {
  return err?.response?.data?.error === "invalid_grant";
};

/* ============================================================
   1. CONNECT GOOGLE
   Start OAuth flow
============================================================ */

export const connectGoogle = (req: any, res: any) => {
  try {
    const oauth2Client = getOAuthClient();

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (!req.user.orgId || !process.env.JWT_SECRET) {
      return res.status(400).json({
        error: "No organization is open",
      });
    }

    // The state carries the user AND the organization that was open when
    // Connect was clicked, signed so it can't be forged or altered. The
    // callback uses it instead of whichever organization is open later.
    const state = jwt.sign(
      {
        purpose: "google-connect",
        // Not `userId`: that is the claim session tokens use, and this token
        // travels in URLs, so it must never be usable as a login.
        uid: req.user.id,
        oid: req.user.orgId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",

      // Forces Google to return a refresh token during reconnect.
      prompt: "consent",

      scope: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file",
      ],

      // Identifies the user and organization after the OAuth callback.
      state,
    });

    return res.json({
      url,
    });
  } catch (err) {
    console.error("Connect Google Error:", err);

    return res.status(500).json({
      error: "Failed to initiate Google OAuth",
    });
  }
};

/* ============================================================
   1b. CONNECT YOUR OWN GOOGLE ACCOUNT (for importing sheet links)
   Open to every role. Read-only, stored per person, and separate from
   the organization's connection that admins set up for Sync.
============================================================ */

export const connectGoogleForImport = (req: any, res: any) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "Failed to initiate Google OAuth" });
    }

    // Not `userId`: that is the claim session tokens use, and this token
    // travels in URLs, so it must never be usable as a login.
    const state = jwt.sign(
      { purpose: "google-import-connect", uid: req.user.id },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    const url = getOAuthClient().generateAuthUrl({
      access_type: "offline",
      prompt: "consent", // makes Google return a refresh token every time
      scope: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
      state,
    });

    return res.json({ url });
  } catch (err) {
    console.error("Connect Google (import) Error:", err);

    return res.status(500).json({
      error: "Failed to initiate Google OAuth",
    });
  }
};

const finishImportConnect = async (userId: string, code: unknown, res: any) => {
  const redirect = (result: "connected" | "failed") =>
    res.redirect(`${frontendCompaniesUrl()}?googleImport=${result}`);

  // Google sends no code when the person cancels or denies access.
  if (!code || typeof code !== "string") return redirect("failed");

  try {
    const { tokens } = await getOAuthClient().getToken(code);

    if (!tokens.refresh_token) return redirect("failed");

    // Only the encrypted refresh token is kept. It is never logged.
    const saved = await prisma.user.updateMany({
      where: { id: userId },
      data: {
        googleSheetsToken: encryptSecret(tokens.refresh_token),
        googleSheetsConnectedAt: new Date(),
      },
    });

    return redirect(saved.count === 1 ? "connected" : "failed");
  } catch (err: any) {
    console.error("Google import connect failed:", err?.response?.data?.error ?? err?.name);
    return redirect("failed");
  }
};

export const disconnectGoogleForImport = async (req: any, res: any) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { googleSheetsToken: null, googleSheetsConnectedAt: null },
    });

    const user = await loadSessionUser(req.user.id);

    return res.status(200).json({
      status: "success",
      data: { user: user ? sanitizeUser(user) : null },
    });
  } catch (err) {
    console.error("Disconnect Google (import) Error:", err);

    return res.status(500).json({ error: "Failed to disconnect Google" });
  }
};

/* ============================================================
   2. GOOGLE CALLBACK
   OAuth return URL
============================================================ */

// Where Google sends people after they connect. FRONTEND_URL lets local
// development return to localhost instead of the live site.
const frontendCompaniesUrl = () =>
  `${(process.env.FRONTEND_URL || "https://www.sponscrm.tech").replace(/\/$/, "")}/companies`;

export const googleCallback = async (req: any, res: any) => {
  try {
    const { code, state } = req.query;

    if (!state || typeof state !== "string") {
      return res.status(400).send("Missing OAuth code or state");
    }

    /* --------------------------------------------------------
       Verify the signed state before doing anything else
    -------------------------------------------------------- */

    let connect: { purpose?: string; uid?: string; oid?: string };

    try {
      connect = jwt.verify(state, process.env.JWT_SECRET as string) as typeof connect;
    } catch {
      return res.status(400).send("Invalid or expired OAuth state");
    }

    /* --------------------------------------------------------
       A person connecting their own Google account to import
       from sheet links. Separate from the organization's
       connection below, and open to every role.
    -------------------------------------------------------- */

    if (connect.purpose === "google-import-connect" && connect.uid) {
      return await finishImportConnect(connect.uid, code, res);
    }

    if (!code || typeof code !== "string") {
      return res.status(400).send("Missing OAuth code or state");
    }

    if (connect.purpose !== "google-connect" || !connect.uid || !connect.oid) {
      return res.status(400).send("Invalid or expired OAuth state");
    }

    /* --------------------------------------------------------
       The user must still be an admin of that organization
    -------------------------------------------------------- */

    const membership = await prisma.membership.findUnique({
      where: {
        userId_orgId: { userId: connect.uid, orgId: connect.oid },
      },
      select: { role: true },
    });

    if (membership?.role !== "ADMIN") {
      return res.status(403).send("Only an organization admin can connect Google");
    }

    const orgId = connect.oid;

    const oauth2Client = getOAuthClient();

    /* --------------------------------------------------------
       Exchange authorization code for tokens
    -------------------------------------------------------- */

    const { tokens } = await oauth2Client.getToken(code as string);

    /* --------------------------------------------------------
       IMPORTANT:
       
       Google does NOT always return a refresh token.

       During reconnect:
       - If Google gives us a new refresh token → save it.
       - If Google doesn't → preserve the existing one.

       MOST IMPORTANT:

       We NEVER modify sheetId here.

       Therefore reconnecting Google continues using
       the organization's existing spreadsheet.
    -------------------------------------------------------- */

    await prisma.organization.update({
      where: {
        id: orgId,
      },

      data: {
        googleAccessToken: tokens.access_token ?? null,

        ...(tokens.refresh_token
          ? {
              googleRefreshToken: tokens.refresh_token,
            }
          : {}),

        googleConnected: true,
      },
    });

    console.log(
      `Google connected successfully for organization ${orgId}`
    );

    /* --------------------------------------------------------
       Redirect back to frontend
    -------------------------------------------------------- */

    return res.redirect(frontendCompaniesUrl());
  } catch (err) {
    console.error("Google Callback Error:", err);

    return res.status(500).send("OAuth failed");
  }
};

/* ============================================================
   3. SYNC TO GOOGLE SHEETS
============================================================ */

export const syncSheets = async (req: any, res: any) => {
  try {
    // The organization open for THIS request. Reading it from the request
    // (not the database) keeps a long sync on the org it started with, even
    // if the user switches organizations meanwhile.
    const user = req.user as { orgId: string | null };

    if (!user.orgId) {
      return res.status(400).json({
        error: "User or organization not found",
      });
    }

    /* --------------------------------------------------------
       Find organization
    -------------------------------------------------------- */

    const org = await prisma.organization.findUnique({
      where: {
        id: user.orgId,
      },
    });

    if (!org) {
      return res.status(400).json({
        error: "Organization not found",
      });
    }

    /* ========================================================
       CHECK GOOGLE CONNECTION
    ======================================================== */

    if (
      !org.googleAccessToken ||
      !org.googleRefreshToken
    ) {
      return res.status(401).json({
        error: "GOOGLE_RECONNECT_REQUIRED",
        message:
          "Your Google connection has expired. Please reconnect Google.",
      });
    }

    /* --------------------------------------------------------
       Configure OAuth client
    -------------------------------------------------------- */

    const oauth2Client = getOAuthClient();

    oauth2Client.setCredentials({
      access_token: org.googleAccessToken,
      refresh_token: org.googleRefreshToken,
    });

    /* --------------------------------------------------------
       Google Sheets API
    -------------------------------------------------------- */

    const sheets = google.sheets({
      version: "v4",
      auth: oauth2Client,
    });

    /* ========================================================
       GET EXISTING SPREADSHEET ID
    ======================================================== */

    let sheetId: string | null =
      org.sheetId ?? null;

    /* ========================================================
       CREATE SPREADSHEET ONLY IF NECESSARY
    ======================================================== */

    if (!sheetId) {
      const sheet = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `${org.name} CRM`,
          },
        },
      });

      sheetId =
        sheet.data.spreadsheetId ?? null;

      if (!sheetId) {
        return res.status(500).json({
          error: "Failed to create spreadsheet",
        });
      }

      /* ------------------------------------------------------
         Save spreadsheet ID.

         This is intentionally NOT cleared when Google
         authentication expires.
      ------------------------------------------------------ */

      await prisma.organization.update({
        where: {
          id: org.id,
        },

        data: {
          sheetId,
        },
      });
    }

    /* ========================================================
       FETCH COMPANIES
    ======================================================== */

    const companies = await prisma.company.findMany({
      where: {
        orgId: org.id,
      },

      include: {
        assignedTo: true,
      },
    });

    type CompanyWithAssignedTo =
      Prisma.CompanyGetPayload<{
        include: {
          assignedTo: true;
        };
      }>;

    /* ========================================================
       GROUP COMPANIES BY DOMAIN
    ======================================================== */

    const grouped: Partial<
      Record<Domain, CompanyWithAssignedTo[]>
    > = {};

    companies.forEach((company) => {
      const domain = company.domain as Domain;

      (grouped[domain] ??= []).push(company);
    });

    /* ========================================================
       GET EXISTING SHEETS/TABS
    ======================================================== */

    const existingSheets =
      await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      });

    const existingTitles =
      existingSheets.data.sheets?.map(
        (sheet) => sheet.properties?.title
      ) || [];

    /* ========================================================
       CREATE MISSING DOMAIN TABS
    ======================================================== */

    const requests = Object.keys(grouped)
      .filter(
        (domain) =>
          !existingTitles.includes(domain)
      )
      .map((domain) => ({
        addSheet: {
          properties: {
            title: domain,
          },
        },
      }));

    if (requests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,

        requestBody: {
          requests,
        },
      });
    }

    /* ========================================================
       WRITE DATA TO DOMAIN TABS
    ======================================================== */

    for (const [
      domain,
      domainCompanies,
    ] of Object.entries(grouped) as Array<
      [Domain, CompanyWithAssignedTo[]]
    >) {
      const values = [
        [
          "Company",
          "Contact",
          "Phone",
          "Status",
          "Assigned To",
        ],

        ...domainCompanies.map((company) => [
          company.name,
          company.contactName,
          company.phoneNumber || "",
          company.status,
          company.assignedTo?.name ||
            "Unassigned",
        ]),
      ];

      /* ------------------------------------------------------
         Clear existing data
      ------------------------------------------------------ */

      await sheets.spreadsheets.values.clear({
        spreadsheetId: sheetId,

        range: `${domain}!A1:Z1000`,
      });

      /* ------------------------------------------------------
         Write fresh data
      ------------------------------------------------------ */

      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,

        range: `${domain}!A1`,

        valueInputOption: "RAW",

        requestBody: {
          values,
        },
      });
    }

    /* ========================================================
       MARK GOOGLE CONNECTION AS ACTIVE
    ======================================================== */

    await prisma.organization.update({
      where: {
        id: org.id,
      },

      data: {
        googleConnected: true,
      },
    });

    /* ========================================================
       SUCCESS
    ======================================================== */

    return res.json({
      message: "Synced successfully",

      url: `https://docs.google.com/spreadsheets/d/${sheetId}`,
    });
  } catch (err: any) {
    console.error(
      "Sync Error:",
      err
    );

    /* ========================================================
       GOOGLE AUTHENTICATION EXPIRED
    ======================================================== */

    if (isGoogleAuthError(err)) {
      try {
        const user = req.user as { orgId: string | null };

        if (user?.orgId) {
          await prisma.organization.update({
            where: {
              id: user.orgId,
            },

            data: {
              /*
               * The credentials are no longer usable.
               */
              googleAccessToken: null,
              googleRefreshToken: null,

              googleConnected: false,

              /*
               * IMPORTANT:
               *
               * DO NOT CLEAR sheetId.
               *
               * This allows the user to reconnect Google
               * and continue using the SAME spreadsheet.
               */
            },
          });

          console.log(
            `Google connection expired for organization ${user.orgId}`
          );
        }
      } catch (dbError) {
        console.error(
          "Failed to mark Google connection as expired:",
          dbError
        );
      }

      /* ------------------------------------------------------
         Tell frontend to start reconnect flow
      ------------------------------------------------------ */

      return res.status(401).json({
        error: "GOOGLE_RECONNECT_REQUIRED",

        message:
          "Your Google connection has expired. Please reconnect Google.",
      });
    }

    /* ========================================================
       OTHER ERRORS
    ======================================================== */

    return res.status(500).json({
      error: "Sync failed",
    });
  }
};