import {prisma} from '../lib/prisma';
import { Role } from '../../generated/prisma/client';
import z from 'zod';
import crypto from 'crypto';


export const createOrganizationSchema = z.object({
    name: z.string().min(1).max(255),

    
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;


const generateInviteCode = () => {
    return crypto.randomBytes(4).toString("hex"); // e.g. "a3f9b2c1"
  };


export const createOrganization = async (
    userId: string,
    input: CreateOrganizationInput
  ) => {
    const { name } = createOrganizationSchema.parse(input);
  
    let inviteCode;

    while (true) {
      inviteCode = generateInviteCode();

     const exists = await prisma.organization.findUnique({
      where: { inviteCode },
      });

       if (!exists) break;
   }
  
    return await prisma.$transaction(async (tx) => {
      // 1. Create org
      const org = await tx.organization.create({
        data: {
          name,
          inviteCode,
          createdById: userId,
        },
      });
  
      // 2. Update user → make admin
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          orgId: org.id,
          role: "ADMIN",
        },
      });
  
      return { org, user };
    });
  };

export const joinOrganization = async (userId: string, inviteCode: string) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Find org by invite code
        const org = await tx.organization.findUnique({
            where: { inviteCode },
        });
        if (!org) {
            throw new Error("Invalid invite code");
        }

        // 2. Update user → join org as MEMBER
        const user = await tx.user.update({
            where: { id: userId },
            data: {
                orgId: org.id,
                role: "MEMBER",
            },
        });

        return { org, user };
    })
};

export const getOrganizationMembers = async (orgId: string) => {
  return await prisma.user.findMany({
    where: { orgId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      role: 'asc', //Put ADMINs first
    }
  });
};

export const removeOrganizationMember = async (memberId: string, orgId: string) => {
  // Verify member belongs to this organization
  const member = await prisma.user.findFirst({
    where: { id: memberId, orgId },
  });

  if (!member || member.orgId !== orgId) {
    throw new Error("Member not found in this organization");
  }

  // Remove the user from the organization
  return await prisma.user.update({
    where: { id: memberId },
    data: {
      orgId: null,
      role: "MEMBER", // Reset role to MEMBER or whatever your default is
    },
  });
};

export const updateMemberRole = async (memberId: string, orgId: string, newRole: Role) => {
  const member = await prisma.user.findFirst({
    where: { id: memberId, orgId },
  });

  if (!member) {
    throw new Error("Member not found in this organization");
  }

  return await prisma.user.update({
    where: { id: memberId },
    data: {
      role: newRole,
    },
  });
};