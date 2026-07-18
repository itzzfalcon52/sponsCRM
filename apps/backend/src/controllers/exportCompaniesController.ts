import { google } from "googleapis";
import { prisma } from "../lib/prisma.js";
import { getOAuthClient } from "../utils/google.js";
import type { Prisma,Domain } from "../../generated/prisma/client.js";

/**
 * 1. CONNECT GOOGLE (start OAuth)
 */
export const connectGoogle = (req:any, res:any) => {
  try {
    const oauth2Client = getOAuthClient();

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file",
      ],
      state: req.user.id, // critical
    });

    res.json({ url });

  } catch (err) {
    console.error("Connect Google Error:", err);
    res.status(500).json({ error: "Failed to initiate Google OAuth" });
  }
};


/**
 * 2. GOOGLE CALLBACK (OAuth return)
 */
export const googleCallback = async (req:any, res:any) => {
  try {
    const { code, state } = req.query;

    const oauth2Client = getOAuthClient();

    // exchange code → tokens
    const { tokens } = await oauth2Client.getToken(code);

    const userId = state;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.orgId) {
      return res.status(400).send("User or org not found");
    }

    await prisma.organization.update({
      where: { id: user.orgId },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
      },
    });

    // redirect back to frontend
    res.redirect("https://www.sponscrm.tech/companies");

  } catch (err) {
    console.error("Google Callback Error:", err);
    res.status(500).send("OAuth failed");
  }
};


/**
 * 3. SYNC TO GOOGLE SHEETS
 */
export const syncSheets = async (req: any, res: any) => {
    try {
      const userId = req.user.id;
  
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
  
      if (!user || !user.orgId) {
        return res.status(400).json({ error: "User or org not found" });
      }
  
      const org = await prisma.organization.findUnique({
        where: { id: user.orgId },
      });
  
      if (!org) {
        return res.status(400).json({ error: "Organization not found" });
      }
  
      if (!org.googleAccessToken) {
        return res.status(400).json({
          error: "Google not connected",
        });
      }
  
      const oauth2Client = getOAuthClient();
  
      oauth2Client.setCredentials({
        access_token: org.googleAccessToken,
        refresh_token: org.googleRefreshToken,
      });
  
      const sheets = google.sheets({
        version: "v4",
        auth: oauth2Client,
      });
  
      // 🧾 CREATE SHEET IF NOT EXISTS
      let sheetId: string | null = org.sheetId ?? null;
  
      if (!sheetId) {
        const sheet = await sheets.spreadsheets.create({
          requestBody: {
            properties: {
              title: `${org.name} CRM`,
            },
          },
        });
  
        sheetId = sheet.data.spreadsheetId ?? null;
  
        if (!sheetId) {
          return res.status(500).json({ error: "Failed to create spreadsheet" });
        }
  
        await prisma.organization.update({
          where: { id: org.id },
          data: { sheetId },
        });
      }
  
      // 📦 FETCH COMPANIES
      const companies = await prisma.company.findMany({
        where: { orgId: org.id },
        include: { assignedTo: true },
      });
  
      type CompanyWithAssignedTo = Prisma.CompanyGetPayload<{
        include: { assignedTo: true };
      }>;
  
      // 📊 GROUP BY DOMAIN
      const grouped: Partial<Record<Domain, CompanyWithAssignedTo[]>> = {};
      companies.forEach((c) => {
        const domain = c.domain as Domain;
        (grouped[domain] ??= []).push(c);
      });
  
      // 🧠 ENSURE DOMAIN SHEETS EXIST (CRITICAL FIX)
      const existingSheets = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      });
  
      const existingTitles =
        existingSheets.data.sheets?.map((s) => s.properties?.title) || [];
  
      const requests = Object.keys(grouped)
        .filter((domain) => !existingTitles.includes(domain))
        .map((domain) => ({
          addSheet: {
            properties: { title: domain },
          },
        }));
  
      if (requests.length > 0) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: sheetId,
          requestBody: { requests },
        });
      }
  
      // ✍️ WRITE DATA (DOMAIN-WISE TABS)
      for (const [domain, domainCompanies] of Object.entries(grouped) as Array<
        [Domain, CompanyWithAssignedTo[]]
      >) {
        const values = [
          ["Company", "Contact", "Phone", "Status", "Assigned To"],
          ...domainCompanies.map((c) => [
            c.name,
            c.contactName,
            c.phoneNumber || "",
            c.status,
            c.assignedTo?.name || "Unassigned",
          ]),
        ];

        await sheets.spreadsheets.values.clear({
          spreadsheetId: sheetId,
          range: `${domain}!A1:Z1000`,
        });
  
        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: `${domain}!A1`, // NOW SAFE (tab exists)
          valueInputOption: "RAW",
          requestBody: { values },
        });

        
      }
  
      res.json({
        message: "Synced successfully",
        url: `https://docs.google.com/spreadsheets/d/${sheetId}`,
      });
  
    } catch (err) {
      console.error("Sync Error:", err);
      res.status(500).json({ error: "Sync failed" });
    }
  };
