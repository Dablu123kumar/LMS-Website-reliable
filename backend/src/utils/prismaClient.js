const { PrismaClient } = require('@prisma/client');

// Singleton Prisma client instance
let prisma;

if (!prisma) {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

module.exports = prisma;
