const express = require('express');
const router = express.Router();
const { generalAuth } = require('../middleware/generalAuth');
const { lmsAuth } = require('../middleware/lmsAuth');
const { validate } = require('../middleware/validate');
const authController = require('../controllers/auth.controller');

// Validation schemas
const signupSchema = {
  firstName: { required: true, type: 'string', minLength: 2, maxLength: 50 },
  lastName: { required: true, type: 'string', minLength: 2, maxLength: 50 },
  email: { required: true, type: 'email' },
  password: { required: true, type: 'string', minLength: 6, maxLength: 128 },
};

const loginSchema = {
  email: { required: true, type: 'email' },
  password: { required: true, type: 'string', minLength: 1 },
};

const lmsLoginSchema = {
  lmsUsername: { required: true, type: 'string', minLength: 1 },
  lmsPassword: { required: true, type: 'string', minLength: 1 },
};

// General auth routes
router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);

// LMS auth routes (separate JWT system)
router.post('/lms/login', validate(lmsLoginSchema), authController.lmsLogin);
router.post('/lms/logout', authController.lmsLogout);

// Protected routes
router.get('/me', generalAuth, authController.getMe);
router.get('/lms/me', lmsAuth, authController.getLmsMe);

module.exports = router;
