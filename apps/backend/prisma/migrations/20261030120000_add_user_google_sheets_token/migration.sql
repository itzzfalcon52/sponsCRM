-- Each person can connect their own Google account (read-only) to import from
-- sheet links. The refresh token is stored encrypted. Both columns are nullable,
-- so existing rows and the currently deployed code are unaffected.
ALTER TABLE "User" ADD COLUMN     "googleSheetsConnectedAt" TIMESTAMP(3),
ADD COLUMN     "googleSheetsToken" TEXT;
