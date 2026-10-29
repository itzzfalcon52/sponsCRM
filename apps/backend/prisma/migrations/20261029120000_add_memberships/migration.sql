-- A user can now belong to several organizations, with a role in each.
-- User.orgId stays and means "the organization currently open".
-- User.role is no longer read by the app; it is kept until a later cleanup migration.

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Membership_orgId_idx" ON "Membership"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_orgId_key" ON "Membership"("userId", "orgId");

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: everyone who is in an organization today keeps exactly that access.
-- Safe to run more than once.
INSERT INTO "Membership" ("id", "userId", "orgId", "role")
SELECT gen_random_uuid()::text, "id", "orgId", "role"
FROM "User"
WHERE "orgId" IS NOT NULL
ON CONFLICT ("userId", "orgId") DO NOTHING;
