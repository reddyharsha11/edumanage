const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Re-seeding admin user and new data...');

  // Upsert admin user
  const adminHash = await bcrypt.hash('superadmin123', 10);
  await prisma.user.upsert({
    where: { email: 'superadmin@edumanage.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@edumanage.com',
      passwordHash: adminHash,
      role: 'admin',
      isApproved: true,
      institutionId: null,
    },
  });

  // Upsert pending driver
  const pendingHash = await bcrypt.hash('pending123', 10);
  await prisma.user.upsert({
    where: { email: 'pending@school.com' },
    update: {},
    create: {
      institutionId: 1,
      name: 'Pending Driver',
      email: 'pending@school.com',
      passwordHash: pendingHash,
      role: 'bus_driver',
      isApproved: false,
    },
  });

  // Seed demo driver locations and session
  const driver = await prisma.user.findUnique({ where: { email: 'driver@school.com' } });
  const route = await prisma.busRoute.findFirst({ where: { driverId: driver?.id } });

  if (driver && route) {
    // Clear old locations
    await prisma.driverLocation.deleteMany({ where: { driverId: driver.id } });
    await prisma.driverSession.deleteMany({ where: { driverId: driver.id } });

    await prisma.driverLocation.createMany({
      data: [
        { driverId: driver.id, routeId: route.id, latitude: 17.4239, longitude: 78.4738, accuracy: 10.0 },
        { driverId: driver.id, routeId: route.id, latitude: 17.4251, longitude: 78.4752, accuracy: 8.5 },
        { driverId: driver.id, routeId: route.id, latitude: 17.4268, longitude: 78.4771, accuracy: 12.0 },
      ],
    });

    await prisma.driverSession.create({
      data: { driverId: driver.id, routeId: route.id, isActive: true },
    });

    // Audit log sample
    await prisma.auditLog.createMany({
      data: [
        { userId: driver.id, action: 'Updated live location', targetTable: 'DriverLocation', details: JSON.stringify({ lat: 17.4268, lng: 78.4771 }) },
        { userId: driver.id, action: 'Marked bus attendance', targetTable: 'Attendance', details: JSON.stringify({ count: 5 }) },
      ],
    });
  }

  console.log('Re-seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
