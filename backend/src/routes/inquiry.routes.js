const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiry.controller');
const { generalAuth, adminOnly } = require('../middleware/generalAuth');

// Public route to submit inquiry
router.post('/', inquiryController.createInquiry);

// Secure Admin-only routes
router.get('/admin/list', generalAuth, adminOnly, inquiryController.listInquiries);
router.get('/admin/unread-count', generalAuth, adminOnly, inquiryController.getUnreadCount);
router.patch('/admin/:id/status', generalAuth, adminOnly, inquiryController.updateInquiryStatus);
router.delete('/admin/:id', generalAuth, adminOnly, inquiryController.deleteInquiry);

module.exports = router;
