import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL environment variable. Check services/api/.env");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(databaseUrl),
});

async function main() {
  const username = "admin";
  const password = process.env.ADMIN_DEFAULT_PASSWORD || "admin123";
  const hashed = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { username },
    update: { password: hashed },
    create: { username, password: hashed }
  });

  const existing = await prisma.kioskState.findFirst();
  if (!existing) await prisma.kioskState.create({ data: { isActive: true, mode: "INDIVIDUAL" } });

  const u1 = await prisma.user.create({ data: { name: "John", individualPoints: 500 } });
  const u2 = await prisma.user.create({ data: { name: "Neha", individualPoints: 300 } });

  await prisma.pair.create({ data: { user1Id: u1.id, user2Id: u2.id, pairPoints: 800 } });

  await prisma.group.create({
    data: {
      name: "Team A",
      groupPoints: 1200,
      members: { create: [{ userId: u1.id }, { userId: u2.id }] }
    }
  });

  const c1 = await prisma.category.create({ data: { name: "Snacks", active: true } });
  const c2 = await prisma.category.create({ data: { name: "Beverages", active: true } });

  await prisma.item.createMany({
    data: [
      { name: "Samosa", categoryId: c1.id, pricePoints: 20, available: true },
      { name: "Vada Pav", categoryId: c1.id, pricePoints: 25, available: true },
      { name: "Tea", categoryId: c2.id, pricePoints: 15, available: true },
      { name: "Coffee", categoryId: c2.id, pricePoints: 30, available: true }
    ]
  });

  console.log("Seed complete. Admin login: admin /", password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
