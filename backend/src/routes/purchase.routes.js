const express = require('express');
const router = express.Router();
const { generalAuth } = require('../middleware/generalAuth');
const { validate } = require('../middleware/validate');
const purchaseController = require('../controllers/purchase.controller');

// Validation schemas
const createOrderSchema = {
  courseId: { required: true, type: 'string' },
};

const verifyPaymentSchema = {
  orderId: { required: true, type: 'string' },
};

// All routes require general auth
router.use(generalAuth);

router.post('/create-order', validate(createOrderSchema), purchaseController.createOrder);
router.post('/verify', validate(verifyPaymentSchema), purchaseController.verifyPayment);
router.get('/history', purchaseController.getPurchaseHistory);

module.exports = router;
