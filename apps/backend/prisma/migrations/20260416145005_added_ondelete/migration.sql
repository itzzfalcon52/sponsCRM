-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_orgId_fkey";

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
