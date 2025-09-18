// in HR_backend/seed.js

const { PrismaClient } = require('./app/generated/prisma');
const prisma = new PrismaClient();

async function main() {

  // --- ADD THIS PART ---
  // Create a default payroll policy if one doesn't exist
  await prisma.payrollPolicy.upsert({
    where: { name: 'Default Company Policy' },
    update: {},
    create: {
      name: 'Default Company Policy',
      isDefault: true,
      otMultiplierWeekday1: 1.5,
      otMultiplierWeekday2: 1.75,
      otMultiplierSleepover: 2.2,
      otMultiplierSunday: 2.0,
      otMultiplierHoliday: 2.5,
    },
  });
  // --- END OF ADDED PART ---

  // ... (any other seeding logic you have can stay here)
  

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });