const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting SQLite Data Export ---');
  try {
    const categories = await prisma.category.findMany();
    const generalUsers = await prisma.generalUser.findMany();
    const lmsCredentials = await prisma.lmsCredential.findMany();
    const courses = await prisma.course.findMany();
    const liveClasses = await prisma.liveClass.findMany();
    const recordings = await prisma.recording.findMany();
    const enrollments = await prisma.enrollment.findMany();
    const payments = await prisma.payment.findMany();
    const notifications = await prisma.notification.findMany();

    const dump = {
      categories,
      generalUsers,
      lmsCredentials,
      courses,
      liveClasses,
      recordings,
      enrollments,
      payments,
      notifications,
    };

    const dumpPath = path.join(__dirname, 'sqlite_dump.json');
    fs.writeFileSync(dumpPath, JSON.stringify(dump, null, 2));

    console.log(`Successfully exported data to: ${dumpPath}`);
    console.log(`- Categories: ${categories.length}`);
    console.log(`- GeneralUsers: ${generalUsers.length}`);
    console.log(`- LmsCredentials: ${lmsCredentials.length}`);
    console.log(`- Courses: ${courses.length}`);
    console.log(`- LiveClasses: ${liveClasses.length}`);
    console.log(`- Recordings: ${recordings.length}`);
    console.log(`- Enrollments: ${enrollments.length}`);
    console.log(`- Payments: ${payments.length}`);
    console.log(`- Notifications: ${notifications.length}`);
  } catch (error) {
    console.error('Export failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
