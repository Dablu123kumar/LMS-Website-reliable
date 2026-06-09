const express = require('express');
const router = express.Router();
const { lmsAuth } = require('../middleware/lmsAuth');
const dashboardController = require('../controllers/dashboard.controller');

// All routes require LMS auth (separate JWT system)
router.use(lmsAuth);

router.get('/my-courses', dashboardController.getMyCourses);
router.get('/course/:id', dashboardController.getCourseContent);
router.get('/stats', dashboardController.getStats);
router.get('/notifications', dashboardController.getNotifications);
router.put('/notifications/:id/read', dashboardController.markNotificationRead);
router.get('/profile', dashboardController.getProfile);
router.put('/profile', dashboardController.updateProfile);
router.put('/profile/password', dashboardController.changePassword);
router.post('/profile/deactivate', dashboardController.deactivateAccount);
router.get('/live-classes/:id/token', dashboardController.getLiveClassToken);

module.exports = router;
