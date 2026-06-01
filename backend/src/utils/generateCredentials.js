const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Generate a unique LMS username from a firstName.
 * Format: firstname + 4 random digits (e.g., "rahul3847")
 * Ensures uniqueness against the database.
 */
async function generateUniqueUsername(firstName) {
  const base = firstName.toLowerCase().replace(/[^a-z]/g, '');
  let username;
  let exists = true;

  while (exists) {
    const digits = crypto.randomInt(1000, 9999).toString();
    username = `${base}${digits}`;
    const found = await prisma.lmsCredential.findUnique({
      where: { lmsUsername: username },
    });
    exists = !!found;
  }

  return username;
}

/**
 * Generate a secure 12-character password with:
 * - At least 2 uppercase letters
 * - At least 2 lowercase letters
 * - At least 2 digits
 * - At least 2 special characters
 * - Remaining chars are random from the full pool
 */
function generateSecurePassword(length = 12) {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#$%&*_+-=';
  const all = upper + lower + digits + special;

  const pickRandom = (charset, count) => {
    let result = '';
    for (let i = 0; i < count; i++) {
      result += charset[crypto.randomInt(charset.length)];
    }
    return result;
  };

  // Guarantee at least 2 of each type
  let password = '';
  password += pickRandom(upper, 2);
  password += pickRandom(lower, 2);
  password += pickRandom(digits, 2);
  password += pickRandom(special, 2);

  // Fill remaining length from full pool
  const remaining = length - password.length;
  password += pickRandom(all, remaining);

  // Shuffle the password characters
  const shuffled = password
    .split('')
    .sort(() => crypto.randomInt(3) - 1)
    .join('');

  return shuffled;
}

/**
 * Generate complete LMS credentials for a new enrollment.
 * @param {string} firstName - User's first name
 * @returns {{ username: string, password: string, hashedPassword: string }}
 */
async function generateCredentials(firstName) {
  const username = await generateUniqueUsername(firstName);
  const password = generateSecurePassword(12);
  const hashedPassword = await bcrypt.hash(password, 12);

  return {
    username,
    password,
    hashedPassword,
  };
}

module.exports = { generateCredentials, generateSecurePassword, generateUniqueUsername };
