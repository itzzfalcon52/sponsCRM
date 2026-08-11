import { prisma } from "./lib/prisma.js";

async function testDatabase() {
  try {
    for (let i = 1; i <= 5; i++) {
      console.time(`DB query ${i}`);

      await prisma.$queryRaw`SELECT 1`;

      console.timeEnd(`DB query ${i}`);
    }
  } catch (error) {
    console.error("Database connection FAILED:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();