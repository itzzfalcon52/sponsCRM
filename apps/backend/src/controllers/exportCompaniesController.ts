import { google } from "googleapis";
import { prisma } from "../lib/prisma.js";
import { getOAuthClient } from "../utils/google.js";
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

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",

      // Forces Google to return a refresh token during reconnect.
      prompt: "consent",

      scope: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file",
      ],

      // Used to identify the user after OAuth callback.
      state: req.user.id,
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
   2. GOOGLE CALLBACK
   OAuth return URL
============================================================ */

export const googleCallback = async (req: any, res: any) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).send("Missing OAuth code or state");
    }

    const oauth2Client = getOAuthClient();

    /* --------------------------------------------------------
       Exchange authorization code for tokens
    -------------------------------------------------------- */

    const { tokens } = await oauth2Client.getToken(code);

    const userId = state as string;

    /* --------------------------------------------------------
       Find user
    -------------------------------------------------------- */

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || !user.orgId) {
      return res.status(400).send(
        "User or organization not found"
      );
    }

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
        id: user.orgId,
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
      `Google connected successfully for organization ${user.orgId}`
    );

    /* --------------------------------------------------------
       Redirect back to frontend
    -------------------------------------------------------- */

    return res.redirect(
      "https://www.sponscrm.tech/companies"
    );
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
    const userId = req.user.id;

    /* --------------------------------------------------------
       Find user
    -------------------------------------------------------- */

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || !user.orgId) {
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
        const userId = req.user.id;

        const user =
          await prisma.user.findUnique({
            where: {
              id: userId,
            },

            select: {
              orgId: true,
            },
          });

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