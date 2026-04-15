-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "googleAccessToken" TEXT,
ADD COLUMN     "googleRefreshToken" TEXT,
ADD COLUMN     "sheetId" TEXT;
