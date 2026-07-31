import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
// @ts-ignore
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash('Password123!', 10);

  await prisma.user.createMany({
    data: [
      { name: 'Admin User', email: 'admin@test.com', password, role: 'ADMIN' },
      { name: 'Staff User', email: 'staff@test.com', password, role: 'STAFF' },
      { name: 'Warehouse User', email: 'warehouse@test.com', password, role: 'WAREHOUSE_OPERATOR' },
      { name: 'Customer User', email: 'customer@test.com', password, role: 'CUSTOMER' },
    ],
  });

  await prisma.category.createMany({
    data: [{ name: 'Cameras' }, { name: 'Drones' }, { name: 'Tools' }],
  });
}

main().finally(() => prisma.$disconnect());
