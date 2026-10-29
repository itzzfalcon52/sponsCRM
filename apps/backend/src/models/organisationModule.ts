import {prisma} from '../lib/prisma.js';
import { Role } from '../../generated/prisma/client.js';
import z from 'zod';
import crypto from 'crypto';


export const createOrganizationSchema = z.object({
    name: z.string().min(1).max(255),

    
});

export const switchOrganizationSchema = z.object({
    orgId: z.string().min(1).max(64),
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

      // 2. The creator is its admin
      await tx.membership.create({
        data: { userId, orgId: org.id, role: "ADMIN" },
      });

      // 3. Open the new organization. User.role is no longer read by this
      // version; it is kept in step only so rolling back the app does not
      // lose roles. Remove with the cleanup migration.
      const user = await tx.user.update({
        where: { id: userId },
        data: { orgId: org.id, role: "ADMIN" },
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

        // 2. Join as MEMBER. Joining an org you already belong to keeps your role.
        const membership = await tx.membership.upsert({
            where: { userId_orgId: { userId, orgId: org.id } },
            create: { userId, orgId: org.id, role: "MEMBER" },
            update: {},
        });

        // 3. Open it (User.role mirrors the active role, see createOrganization)
        const user = await tx.user.update({
            where: { id: userId },
            data: { orgId: org.id, role: membership.role },
        });

        return { org, user };
    })
};

export class NotAMemberError extends Error {
  constructor() {
    super("You are not a member of that organization.");
  }
}

/** Opens another organization the user already belongs to. */
export const switchOrganization = async (userId: string, orgId: string) => {
  const membership = await prisma.membership.findUnique({
    where: { userId_orgId: { userId, orgId } },
    select: { orgId: true, role: true },
  });

  if (!membership) throw new NotAMemberError();

  // User.role mirrors the active role, see createOrganization
  return prisma.user.update({
    where: { id: userId },
    data: { orgId, role: membership.role },
  });
};

export const getOrganizationMembers = async (orgId: string) => {
  const memberships = await prisma.membership.findMany({
    where: { orgId },
    select: {
      role: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: {
      role: 'asc', //Put ADMINs first
    },
  });

  // Same shape as before: one flat object per person, with their role here.
  return memberships.map((m) => ({
    id: m.user.id,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
    createdAt: m.createdAt,
  }));
};

export const removeOrganizationMember = async (memberId: string, orgId: string) => {
  return await prisma.$transaction(async (tx) => {
    const membership = await tx.membership.findUnique({
      where: { userId_orgId: { userId: memberId, orgId } },
    });

    if (!membership) {
      throw new Error("Member not found in this organization");
    }

    await tx.membership.delete({ where: { id: membership.id } });

    // If this was the org they had open, they fall back to another one they
    // belong to (or none).
    await tx.user.updateMany({
      where: { id: memberId, orgId },
      data: { orgId: null },
    });
  });
};

export const updateMemberRole = async (memberId: string, orgId: string, newRole: Role) => {
  return await prisma.$transaction(async (tx) => {
    const membership = await tx.membership.findUnique({
      where: { userId_orgId: { userId: memberId, orgId } },
    });

    if (!membership) {
      throw new Error("Member not found in this organization");
    }

    if (membership.role === "ADMIN" && newRole !== "ADMIN") {
      const otherAdmins = await tx.membership.count({
        where: { orgId, role: "ADMIN", NOT: { userId: memberId } },
      });
      if (otherAdmins === 0) {
        throw new Error("An organization must keep at least one Admin.");
      }
    }

    const updated = await tx.membership.update({
      where: { id: membership.id },
      data: { role: newRole },
    });

    // Keep the legacy column in step if this is the org they have open
    await tx.user.updateMany({
      where: { id: memberId, orgId },
      data: { role: newRole },
    });

    return updated;
  });
};

export const updateOrganizationName = async (orgId: string, name: string) => {
  return await prisma.organization.update({
    where: { id: orgId },
    data: { name },
  });
};

export const leaveOrganization = async (userId: string, orgId: string) => {
  return await prisma.$transaction(async (tx) => {
    const membership = await tx.membership.findUnique({
      where: { userId_orgId: { userId, orgId } },
    });

    if (!membership) {
      throw new Error("You are not a member of this organization.");
    }

    // The last admin can't leave
    if (membership.role === "ADMIN") {
      const otherAdmins = await tx.membership.count({
        where: { orgId, role: "ADMIN", NOT: { userId } },
      });

      if (otherAdmins === 0) {
        throw new Error("You are the last Admin. Appoint another Admin before leaving.");
      }
    }

    await tx.membership.delete({ where: { id: membership.id } });

    // Fall back to another organization they belong to (or none)
    await tx.user.updateMany({
      where: { id: userId, orgId },
      data: { orgId: null },
    });
  });
};

export const deleteFullOrganization = async (orgId: string) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Delete ALL activities for all companies belonging to this org
    // We filter by company: { orgId }
    await tx.activity.deleteMany({
      where: {
        company: {
          orgId: orgId
        }
      }
    });

    // 2. Clear relations in the Company table before deleting
    // We need to set assignedToId and createdById to null or delete companies
    // Since we are deleting the whole org, we delete the companies.
    await tx.company.deleteMany({
      where: { orgId }
    });

    // 3. Notifications keep an org id but have no foreign key
    await tx.notification.deleteMany({
      where: { orgId }
    });

    // 4. Anyone who had this org open falls back to another membership (or none)
    await tx.user.updateMany({
      where: { orgId },
      data: { orgId: null }
    });

    // 5. Finally, delete the Organization itself. Its memberships cascade.
    return await tx.organization.delete({
      where: { id: orgId }
    });
  });
};
