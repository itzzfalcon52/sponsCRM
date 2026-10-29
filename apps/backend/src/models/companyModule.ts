import { prisma } from "../lib/prisma.js";
import { Prisma } from "../../generated/prisma/client";
import { z } from "zod";
import { Domain } from "../../generated/prisma/client.js";
import {createNotification,getMyNotifications} from "./notificationModule.js";

/* ================================
   ENUM SCHEMAS
================================ */

const StatusSchema = z.enum([
  "NOT_CONTACTED",
  "CONTACTED",
  "IN_TALKS",
  "NEGOTIATING",
  "POSITIVE",
  "CLOSED",
  "REJECTED",
]);

const DomainSchema = z.enum([
  "EDTECH",
  "FINTECH",
  "PREVIOUS_YEAR",
  "BRAND_ACTIVATION",
  "MEDIA",
  "STATIONERY",
  "AI_TECH",
  "STARTUP",
  "FITNESS",
  "GAMING",
  "FMCG",
  "AUDIO_MOBILE",
  "BANK",
  "AUTOMOBILE_TRAVEL",
  "FASHION",
  "SKINCARE",
  "HEALTHCARE",
  "WORKSHOP",
  "MISCELLANEOUS",
  "HACKATHON",
]);

const TypeSchema = z.enum(["CASH", "IN_KIND"]).optional();


/* ============================================================
   BULK IMPORT
   ============================================================ */

export const BULK_IMPORT_MAX_ROWS = 500;

export const bulkImportCompanySchema = z.object({
  domain: DomainSchema,

  companies: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Company name is required").max(255),

        // POC is often missing in real sheets; the column is non-null so we store "".
        contactName: z.string().trim().max(100).default(""),

        linkedinUrl: z.string().trim().optional().or(z.literal("")),

        phoneNumber: z.string().trim().optional().or(z.literal("")),

        email: z
          .string()
          .trim()
          .email("Invalid email address")
          .optional()
          .or(z.literal("")),
      })
    )
    .min(1, "At least one company is required")
    .max(BULK_IMPORT_MAX_ROWS, `You can import at most ${BULK_IMPORT_MAX_ROWS} companies at once`),
});

export type BulkImportCompanyInput = z.infer<typeof bulkImportCompanySchema>;

export type BulkImportSkipReason = "DUPLICATE_IN_SHEET" | "ALREADY_EXISTS";

export type BulkImportSkippedRow = {
  /** 1-based position within the submitted batch */
  row: number;
  name: string;
  reason: BulkImportSkipReason;
};

const normalizeCompanyName = (name: string) =>
  name.trim().replace(/\s+/g, " ").toLowerCase();

/* ============================================================
   BULK IMPORT FUNCTION
   Valid rows are imported; duplicates are skipped and reported
   instead of failing the whole batch.
   ============================================================ */

export const bulkImportCompanies = async (
  userId: string,
  orgId: string,
  input: BulkImportCompanyInput
) => {
  const data = bulkImportCompanySchema.parse(input);

  const skipped: BulkImportSkippedRow[] = [];
  const seen = new Set<string>();
  const candidates: { row: number; key: string; company: (typeof data.companies)[number] }[] = [];

  data.companies.forEach((company, index) => {
    const key = normalizeCompanyName(company.name);
    if (seen.has(key)) {
      skipped.push({ row: index + 1, name: company.name, reason: "DUPLICATE_IN_SHEET" });
      return;
    }
    seen.add(key);
    candidates.push({ row: index + 1, key, company });
  });

  // One query for all names; names are matched case-insensitively.
  const existing = await prisma.company.findMany({
    where: {
      orgId,
      OR: candidates.map(({ company }) => ({
        name: { equals: company.name.trim(), mode: "insensitive" as const },
      })),
    },
    select: { name: true },
  });
  const existingKeys = new Set(existing.map((c) => normalizeCompanyName(c.name)));

  const toCreate = candidates.filter(({ key, row, company }) => {
    if (!existingKeys.has(key)) return true;
    skipped.push({ row, name: company.name, reason: "ALREADY_EXISTS" });
    return false;
  });

  // skipDuplicates covers a concurrent insert racing past the check above
  // (@@unique([name, orgId])).
  const result = toCreate.length
    ? await prisma.company.createMany({
        data: toCreate.map(({ company }) => ({
          name: company.name.trim().replace(/\s+/g, " "),
          contactName: company.contactName,
          linkedinUrl: company.linkedinUrl?.trim() || null,
          phoneNumber: company.phoneNumber?.trim() || null,
          email: company.email?.trim() || null,
          domain: data.domain,
          status: "NOT_CONTACTED" as const,
          createdById: userId,
          assignedToId: userId,
          orgId,
        })),
        skipDuplicates: true,
      })
    : { count: 0 };

  skipped.sort((a, b) => a.row - b.row);

  return { createdCount: result.count, skipped };
};

/* ================================
   CREATE
================================ */

export const createCompanySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Company name is required")
    .max(255),

  contactName: z
    .string()
    .trim()
    .min(2, "POC name must contain at least 2 characters")
    .max(100),

  linkedinUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),

  phoneNumber: z
    .string()
    .trim()
    .min(5, "Phone number is too short")
    .max(30)
    .optional()
    .or(z.literal("")),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),

  domain: DomainSchema.default("EDTECH"),

  status: StatusSchema.default("NOT_CONTACTED"),

  amount: z
    .number()
    .int()
    .nonnegative()
    .optional(),

  type: TypeSchema,

  nextFollowUp: z.coerce.date().optional(),

  lastContactedAt: z.coerce.date().optional(),

  note: z
    .string()
    .max(1000)
    .optional(),
});

export type CreateCompanyInput =
  z.infer<typeof createCompanySchema>;

/**
 * CREATE COMPANY 
 */
export const createCompany = async (
  userId: string,
  orgId: string,
  input: CreateCompanyInput
) => {
  const data = createCompanySchema.parse(input);

  return prisma.company.create({
    data: {
      ...data,
      createdById: userId,
      // The person who adds a company starts out responsible for it. Set here
      // (not via the schema) so clients can't pick an assignee, and without
      // assignCompany so the creator isn't notified about their own action.
      assignedToId: userId,
      orgId,
    },
  });
};

/* ================================
   READ
================================ */

export const getCompanyById = async (id: string, orgId: string) => {
  return prisma.company.findFirst({
    where: {
      id,
      orgId, 
    },
  });
};

/* ================================
   LIST 
================================ */

export const listCompaniesSchema = z.object({
    q: z.string().optional(),
    status: StatusSchema.optional(),
    domain: DomainSchema.optional(),
    assignedTo: z.string().optional(),
    createdBy: z.string().pipe(z.uuid()).optional(),
  
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    activities:z.array(z.object({})).optional(), // Placeholder for future activity-based filtering
  });

export type ListCompaniesInput = z.infer<typeof listCompaniesSchema>;

export const getCompanyCreators = async (orgId: string, memberId?: string) => {
  return prisma.user.findMany({
    where: {
      createdCompanies: {
        some: {
          orgId,
          ...(memberId
            ? { OR: [{ assignedToId: memberId }, { createdById: memberId }] }
            : {}),
        },
      },
    },
    select: { id: true, name: true, email: true },
    orderBy: [{ name: "asc" }, { email: "asc" }],
  });
};

export const listCompanies = async (
    orgId: string,
    input: Partial<ListCompaniesInput> = {}
  ) => {
    const { q, status, domain, assignedTo, createdBy, page, limit } =
      listCompaniesSchema.parse(input);
  
    const skip = (page - 1) * limit;

    const where = {
      orgId,
      status: status ?? undefined,
      domain: domain ?? undefined,
      assignedToId: assignedTo ?? undefined,
      createdById: createdBy,
      OR: q ? [
        { name: { contains: q, mode: "insensitive" as Prisma.QueryMode } },
        { contactName: { contains: q, mode: "insensitive" as Prisma.QueryMode } },
      ] : undefined,
    };
  
   
    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
  
        select: {
          id: true,
          name: true,
          contactName: true,
          phoneNumber: true, 
          linkedinUrl: true,
          email: true,
          amount: true,      
          type: true,       
          status: true,
          domain: true,
          assignedToId: true,
          assignedTo: {      // Ensure assignedTo object is included if needed for UI
            select: {
              id: true,
              name: true
            }
          },
          createdById: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          createdAt: true,
          lastContactedAt:true,
          nextFollowUp:true,
          activities: {
            orderBy: { createdAt: "desc" },
            take: 1, // Only fetch the most recent activity for the table
            select: {
              type: true,
              createdAt: true
            }
          }
        },
  
        orderBy: { createdAt: "desc" },
  
        take: limit,
        skip,
      }),
  
      //  COUNT QUERY
      prisma.company.count({ where }),
    ]);
  
    //  RETURN STRUCTURED RESPONSE
    return {
      companies,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  };

/* ================================
   UPDATE
================================ */

export const updateCompanySchema = createCompanySchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

export const updateCompany = async (
  id: string,
  orgId: string,
  input: UpdateCompanyInput
) => {
  const data = updateCompanySchema.parse(input);

  return prisma.company.updateMany({
    where: {
      id,
      orgId, 
    },
    data,
  });
};

/* ================================
   DELETE
================================ */

export const deleteCompany = async (id: string, orgId: string) => {
  return prisma.company.deleteMany({
    where: {
      id,
      orgId, //  SECURITY
    },
  });
};

/* ================================
 MY COMPANIES 
================================ */

export const getMyCompanies = async (
  userId: string,
  orgId: string,
  input: Partial<ListCompaniesInput> = {}
) => {
  const { status, domain, createdBy, page, limit, q } =
    listCompaniesSchema.parse(input);

  const skip = (page - 1) * limit;

  const whereClause: Prisma.CompanyWhereInput = {
    orgId,

    // Member sees:
    // 1. Companies assigned to them
    // 2. Companies they created
    OR: [
      { assignedToId: userId },
      { createdById: userId },
    ],

    status: status ?? undefined,
    domain: domain ?? undefined,
    createdById: createdBy,

    ...(q
      ? {
          AND: [
            {
              OR: [
                {
                  name: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
                {
                  contactName: {
                    contains: q,
                    mode: "insensitive",
                  },
                },
              ],
            },
          ],
        }
      : {}),
  };

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where: whereClause,

      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        activities: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            type: true,
            createdAt: true,
          },
        },
      },

      orderBy: {
        updatedAt: "desc",
      },

      take: limit,
      skip,
    }),

    prisma.company.count({
      where: whereClause,
    }),
  ]);

  return {
    companies,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};
/* ================================
 Company Assigning Logic
================================ */

export const assignCompany = async (
    companyId: string,
    orgId: string,
    assignedToId: string | null
  ) => {
    // 1. Check company exists
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        orgId,
      },
      select: {
        assignedToId: true,
      },
    });
  
    if (!company) {
      throw new Error("Company not found");
    }
  
    // 2. Prevent redundant update
    if (company.assignedToId === assignedToId) {
      return { skipped: true };
    }
  
    // 3. Update
    const updatedCompany=  await prisma.company.update({
      where: { id: companyId },
      data: { assignedToId },
    });

    // TRIGGER NOTIFICATION: Only if assigned to a user (not unassigned)
    if (assignedToId) {
      await createNotification(
        assignedToId,
        orgId,
        "New Company Assigned",
        `You have been assigned to manage ${updatedCompany.name}.`,
        "ASSIGNMENT",
        `/dashboard/companies/${companyId}`
      );
    }

    return updatedCompany;
  }; 

/* ================================
 BULK ASSIGNING 
================================ */

export const bulkAssignSchema = z.object({
    companyIds: z
      .array(z.string().pipe(z.uuid()))
      .min(1, "At least one company must be selected"),
  
      assignedToId: z.string().pipe(z.uuid()).nullable().optional(),
      count:z.number().optional(), // For response, not input
  });
  
  export type BulkAssignInput = z.infer<typeof bulkAssignSchema>;

  

export const bulkAssignCompanies = async (
    companyIds: string[],
    orgId: string,
    assignedToId: string | null 
  ) => {
    const result = await prisma.company.updateMany({
      where: {
        id: { in: companyIds },
        orgId, 
      },
     
      data: {
        assignedToId,
      },
    });

    // TRIGGER NOTIFICATION: For bulk actions
    if (assignedToId && result.count > 0) {
      await createNotification(
        assignedToId,
        orgId,
        "Bulk Assignment",
        `${result.count} new companies have been assigned to your portfolio.`,
        "ASSIGNMENT",
        `/dashboard/companies`
      );
    }

    return result;
  };