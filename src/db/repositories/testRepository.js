import prisma from "../prisma.js";

// Insert a record
export async function createTest(name) {
  return prisma.test.create({
    data: { name },
  });
}

// Fetch all records
export async function getAllTests() {
  return prisma.test.findMany();
}
