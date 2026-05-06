const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // Institution
  const institution = await prisma.institution.create({
    data: {
      name: 'Sunshine Public School',
      address: 'Hyderabad, Telangana',
    },
  });

  // Users
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const operator = await prisma.user.create({
    data: {
      institutionId: institution.id,
      name: 'School Admin',
      email: 'admin@school.com',
      passwordHash: adminPasswordHash,
      role: 'operator',
      isApproved: true,
    },
  });

  const driverPasswordHash = await bcrypt.hash('driver123', 10);
  const driver = await prisma.user.create({
    data: {
      institutionId: institution.id,
      name: 'Ramesh Kumar',
      email: 'driver@school.com',
      passwordHash: driverPasswordHash,
      role: 'bus_driver',
      isApproved: true,
    },
  });

  // Classes
  const class1A = await prisma.class.create({ data: { institutionId: institution.id, name: 'Class 1', section: 'A' } });
  const class2B = await prisma.class.create({ data: { institutionId: institution.id, name: 'Class 2', section: 'B' } });
  const class3A = await prisma.class.create({ data: { institutionId: institution.id, name: 'Class 3', section: 'A' } });
  const class4B = await prisma.class.create({ data: { institutionId: institution.id, name: 'Class 4', section: 'B' } });

  // Students for Class 1A
  const studentsData = [
    { name: 'Ravi Kumar', dob: new Date('2015-06-12'), parentName: 'Suresh Kumar', parentPhone: '9876543210', parentLanguage: 'Telugu' },
    { name: 'Sita Devi', dob: new Date('2015-03-22'), parentName: 'Ramaiah Devi', parentPhone: '9876543211', parentLanguage: 'Hindi' },
    { name: 'Arjun Reddy', dob: new Date('2015-09-05'), parentName: 'Venkat Reddy', parentPhone: '9876543212', parentLanguage: 'Telugu' },
    { name: 'Priya Sharma', dob: new Date('2015-11-18'), parentName: 'Mohan Sharma', parentPhone: '9876543213', parentLanguage: 'Hindi' },
    { name: 'Kiran Babu', dob: new Date('2015-07-30'), parentName: 'Babu Rao', parentPhone: '9876543214', parentLanguage: 'Telugu' },
  ];

  const createdStudents = [];
  for (const s of studentsData) {
    createdStudents.push(
      await prisma.student.create({
        data: {
          classId: class1A.id,
          ...s,
        },
      })
    );
  }

  // Bus Route
  const route = await prisma.busRoute.create({
    data: {
      institutionId: institution.id,
      routeName: 'Route A - Kukatpally',
      driverId: driver.id,
    },
  });

  // Assign students to bus route
  for (const s of createdStudents) {
    await prisma.busRouteStudent.create({
      data: {
        routeId: route.id,
        studentId: s.id,
      },
    });
  }

  // Dummy Marks and Attendance
  for (const s of createdStudents) {
    await prisma.mark.create({
      data: {
        studentId: s.id,
        term: 'Term 1',
        subject: 'Math',
        marksObtained: Math.floor(Math.random() * 20) + 80,
        totalMarks: 100,
      },
    });
    
    await prisma.attendance.create({
      data: {
        studentId: s.id,
        date: new Date(),
        status: 'present',
        type: 'academic',
        markedById: operator.id,
      },
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
