import { prisma } from "../lib/prisma";
import { Prisma } from "../../generated/prisma/client";
import { z } from "zod";
import { Domain } from "../../generated/prisma/client";

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
]);

const TypeSchema = z.enum(["CASH", "IN_KIND"]).optional();

/* ================================
   CREATE
================================ */

export const createCompanySchema = z.object({
  name: z.string().min(1).max(255),
  contactName: z.string().min(2).max(100),

  linkedinUrl: z.string().optional(),
  phoneNumber: z.string().min(5).max(30).optional(),
  domain: DomainSchema.default("EDTECH"),

  status: StatusSchema.default("NOT_CONTACTED"),
  amount: z.number().int().nonnegative().optional(),
  type: TypeSchema,

  nextFollowUp: z.coerce.date().optional(),
  lastContactedAt: z.coerce.date().optional(),
  note:z.string().max(1000).optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

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
  
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    activities:z.array(z.object({})).optional(), // Placeholder for future activity-based filtering
  });

export type ListCompaniesInput = z.infer<typeof listCompaniesSchema>;

export const listCompanies = async (
    orgId: string,
    input: Partial<ListCompaniesInput> = {}
  ) => {
    const { q, status, domain, assignedTo, page, limit } =
      listCompaniesSchema.parse(input);
  
    const skip = (page - 1) * limit;
  
   
    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where: {
          orgId,
          status: status ?? undefined,
          domain: domain ?? undefined,
          assignedToId: assignedTo ?? undefined,
         
  
          OR: q
            ? [
                { name: { contains: q, mode: "insensitive" } },
                { contactName: { contains: q, mode: "insensitive" } },
                // domain is an enum in Prisma, so it doesn't support `contains`
                // Allow searching by exact enum value (case-insensitive input)
                {
                  domain: {
                    equals: q.toUpperCase() as Domain,
                  },
                },
              ]
            : undefined,
        },
  
        select: {
          id: true,
          name: true,
          contactName: true,
          phoneNumber: true, 
          linkedinUrl: true,
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
      prisma.company.count({
        where: {
          orgId,
          status: status ?? undefined,
          domain: domain ?? undefined,
          assignedToId: assignedTo ?? undefined,
        },
      }),
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
  // Use the same schema, but default to the provided limits
  const { status, domain, page, limit } = listCompaniesSchema.parse(input);
  const skip = (page - 1) * limit;

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where: {
        orgId,
        assignedToId: userId,           // Force scope to this user
        status: status ?? undefined,     // Allow filtering by status for Kanban
        domain: domain ?? undefined,
      },
      include: {
        activities: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            type: true,
            createdAt: true
          }
        }
      },
      orderBy: { updatedAt: "desc" },
      take: limit,
      skip,
    }),
    prisma.company.count({
      where: {
        orgId,
        assignedToId: userId,
        status: status ?? undefined,
        domain: domain ?? undefined,
      },
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
    return prisma.company.update({
      where: { id: companyId },
      data: { assignedToId },
    });
  }; 

/* ================================
 BULK ASSIGNING 
================================ */

export const bulkAssignSchema = z.object({
    companyIds: z
      .array(z.string().pipe(z.uuid()))
      .min(1, "At least one company must be selected"),
  
      assignedToId: z.string().pipe(z.uuid()).nullable().optional(),
  });
  
  export type BulkAssignInput = z.infer<typeof bulkAssignSchema>;

  

export const bulkAssignCompanies = async (
    companyIds: string[],
    orgId: string,
    assignedToId: string | null 
  ) => {
    return prisma.company.updateMany({
      where: {
        id: { in: companyIds },
        orgId, 
      },
      data: {
        assignedToId,
      },
    });
  };