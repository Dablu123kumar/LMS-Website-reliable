const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function convertDates(obj) {
  if (!obj) return obj;
  const dateKeys = ['createdAt', 'updatedAt', 'lastLogin', 'scheduledAt', 'uploadedAt', 'sentAt'];
  const newObj = { ...obj };
  for (const key of dateKeys) {
    if (newObj[key]) {
      newObj[key] = new Date(newObj[key]);
    }
  }
  return newObj;
}

async function main() {
  console.log('--- Starting PostgreSQL Data Import ---');
  const dumpPath = path.join(__dirname, 'sqlite_dump.json');
  
  if (!fs.existsSync(dumpPath)) {
    console.error(`Dump file not found at: ${dumpPath}`);
    process.exit(1);
  }

  const dump = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));

  try {
    // 1. Categories
    console.log('Importing Categories...');
    for (const item of dump.categories) {
      await prisma.category.create({ data: convertDates(item) });
    }
    console.log(`- Imported ${dump.categories.length} Categories`);

    // 2. GeneralUsers
    console.log('Importing GeneralUsers...');
    for (const item of dump.generalUsers) {
      await prisma.generalUser.create({ data: convertDates(item) });
    }
    console.log(`- Imported ${dump.generalUsers.length} GeneralUsers`);

    // 3. LmsCredentials
    console.log('Importing LmsCredentials...');
    for (const item of dump.lmsCredentials) {
      await prisma.lmsCredential.create({ data: convertDates(item) });
    }
    console.log(`- Imported ${dump.lmsCredentials.length} LmsCredentials`);

    // 4. Courses
    console.log('Importing Courses...');
    for (const item of dump.courses) {
      await prisma.course.create({ data: convertDates(item) });
    }
    console.log(`- Imported ${dump.courses.length} Courses`);

    // 5. LiveClasses
    console.log('Importing LiveClasses...');
    for (const item of dump.liveClasses) {
      await prisma.liveClass.create({ data: convertDates(item) });
    }
    console.log(`- Imported ${dump.liveClasses.length} LiveClasses`);

    // 6. Recordings
    console.log('Importing Recordings...');
    for (const item of dump.recordings) {
      await prisma.recording.create({ data: convertDates(item) });
    }
    console.log(`- Imported ${dump.recordings.length} Recordings`);

    // 7. Enrollments
    console.log('Importing Enrollments...');
    for (const item of dump.enrollments) {
      await prisma.enrollment.create({ data: convertDates(item) });
    }
    console.log(`- Imported ${dump.enrollments.length} Enrollments`);

    // 8. Payments
    console.log('Importing Payments...');
    for (const item of dump.payments) {
      await prisma.payment.create({ data: convertDates(item) });
    }
    console.log(`- Imported ${dump.payments.length} Payments`);

    // 9. Notifications
    console.log('Importing Notifications...');
    for (const item of dump.notifications) {
      await prisma.notification.create({ data: convertDates(item) });
    }
    console.log(`- Imported ${dump.notifications.length} Notifications`);

    console.log('--- PostgreSQL Data Import Completed Successfully ---');
  } catch (error) {
    console.error('Import failed during execution:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
