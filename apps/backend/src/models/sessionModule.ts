import type { Role } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

/* ============================================================
   ACTIVE ORGANIZATION
   A user can belong to several organizations. User.orgId is the one
   currently open; the role always comes from the membership in it.
   ============================================================ */

export type MembershipLike = { orgId: string; role: Role };

/**
 * Membership for the organization the user has open. If that organization
 * is missing or the user is no longer a member (removed, org deleted), the
 * oldest membership is used so the user is never left without an org
 * while they still belong to one. Memberships must be oldest first.
 */
export const resolveActiveMembership = <M extends MembershipLike>(
  activeOrgId: string | null | undefined,
  memberships: M[] | null | undefined
): M | null => {
  const list = memberships ?? [];
  return (
    (activeOrgId ? list.find((m) => m.orgId === activeOrgId) : undefined) ??
    list[0] ??
    null
  );
};

/** Include clause that loads everything the session needs. */
export const sessionInclude = {
  memberships: {
    include: { organization: true },
    orderBy: { createdAt: "asc" as const },
  },
};

/**
 * Turns a user loaded with `sessionInclude` into the shape the rest of the
 * app expects: `orgId`, `role` and `organization` describe the active org,
 * and `organizations` lists every org the user belongs to.
 */
export const withActiveOrg = <
  U extends { memberships?: { orgId: string; role: Role; organization: any }[] | null }
>(
  user: U & { orgId?: string | null }
) => {
  const memberships = user.memberships ?? [];
  const active = resolveActiveMembership(user.orgId, memberships);

  return {
    ...user,
    orgId: active?.orgId ?? null,
    role: (active?.role ?? "MEMBER") as Role,
    organization: active?.organization ?? null,
    organizations: memberships.map((m) => ({
      id: m.orgId,
      name: m.organization?.name as string,
      role: m.role,
    })),
  };
};

/** Loads a user with their active org and all memberships, or null. */
export const loadSessionUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: sessionInclude,
  });
  return user ? withActiveOrg(user) : null;
};
