const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../utils/prismaClient');
const { generateCredentials } = require('../utils/generateCredentials');
const { sendCredentialEmail } = require('../utils/mailer');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// ─── Razorpay SDK (optional — falls back to manual if not configured) ────────
let razorpayInstance = null;
try {
  const Razorpay = require('razorpay');
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (keyId && keySecret) {
    razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
    console.log('[Payment] Razorpay initialized (key:', keyId.slice(0, 12) + '...)');
  } else {
    console.log('[Payment] Razorpay keys not set — using manual payment flow.');
  }
} catch (err) {
  console.log('[Payment] Razorpay SDK not available — using manual payment flow.');
}

/**
 * POST /api/v1/purchase/create-order
 * Create a payment order for a course (generalAuth required)
 */
async function createOrder(req, res, next) {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || !course.isPublished) {
      return errorResponse(res, 'Course not found or unavailable.', 404);
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        generalUserId_courseId: {
          generalUserId: userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return errorResponse(res, 'You are already enrolled in this course.', 409);
    }

    // Calculate amount (discountPrice is the discount amount subtracted from the price)
    const amount = typeof course.discountPrice === 'number' && course.discountPrice < course.price
      ? (course.price - course.discountPrice)
      : course.price;

    // ─── Razorpay Order ──────────────────────────────────────────────────
    if (razorpayInstance) {
      const razorpayOrder = await razorpayInstance.orders.create({
        amount: Math.round(amount * 100), // Razorpay expects paise
        currency: 'INR',
        receipt: `receipt_${uuidv4().replace(/-/g, '').slice(0, 16)}`,
        notes: { courseId, userId, courseTitle: course.title },
      });

      // Create payment record with Razorpay order id
      const payment = await prisma.payment.create({
        data: {
          generalUserId: userId,
          courseId,
          gateway: 'RAZORPAY',
          gatewayOrderId: razorpayOrder.id,
          status: 'PENDING',
          amount,
          currency: 'INR',
        },
      });

      return successResponse(res, 'Razorpay order created.', {
        orderId: payment.id,
        gateway: 'RAZORPAY',
        razorpayOrderId: razorpayOrder.id,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        courseTitle: course.title,
      }, 201);
    }

    // ─── Manual fallback (no Razorpay keys) ──────────────────────────────
    const payment = await prisma.payment.create({
      data: {
        generalUserId: userId,
        courseId,
        gateway: 'MANUAL',
        gatewayOrderId: `order_${uuidv4().replace(/-/g, '').slice(0, 16)}`,
        status: 'PENDING',
        amount,
        currency: 'INR',
      },
    });

    return successResponse(res, 'Order created successfully.', {
      orderId: payment.id,
      gateway: 'MANUAL',
      gatewayOrderId: payment.gatewayOrderId,
      amount: payment.amount,
      currency: payment.currency,
      courseTitle: course.title,
    }, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/purchase/verify
 * Verify payment, create enrollment, generate LMS credentials
 * This is the critical endpoint that bridges general auth → LMS auth
 */
async function verifyPayment(req, res, next) {
  try {
    const { orderId, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user.id;

    // Find the payment
    const payment = await prisma.payment.findUnique({
      where: { id: orderId },
      include: { course: true },
    });

    if (!payment) {
      return errorResponse(res, 'Payment order not found.', 404);
    }

    if (payment.generalUserId !== userId) {
      return errorResponse(res, 'Unauthorized. This order does not belong to you.', 403);
    }

    if (payment.status === 'SUCCESS') {
      return errorResponse(res, 'This payment has already been verified.', 409);
    }

    // ─── Razorpay signature verification ─────────────────────────────────
    if (payment.gateway === 'RAZORPAY' && razorpayInstance) {
      if (!razorpay_payment_id || !razorpay_signature) {
        return errorResponse(res, 'Missing Razorpay payment ID or signature.', 400);
      }

      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${payment.gatewayOrderId}|${razorpay_payment_id}`)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        // Mark payment as failed
        await prisma.payment.update({
          where: { id: orderId },
          data: { status: 'FAILED' },
        });
        return errorResponse(res, 'Payment verification failed. Invalid signature.', 400);
      }
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: orderId },
      data: {
        status: 'SUCCESS',
        gatewayPaymentId: razorpay_payment_id || `pay_${uuidv4().replace(/-/g, '').slice(0, 16)}`,
        gatewayResponse: razorpay_signature ? JSON.stringify({ razorpay_signature }) : null,
      },
    });

    // Get user info for credential generation
    const user = await prisma.generalUser.findUnique({
      where: { id: userId },
    });

    // Check if user already has LMS credentials
    let lmsCredential = await prisma.lmsCredential.findFirst({
      where: { generalUserId: userId, isActive: true },
    });

    let plainPassword = null;
    let isNewCredential = false;

    if (!lmsCredential) {
      // Generate new LMS credentials
      const creds = await generateCredentials(user.firstName);
      plainPassword = creds.password;
      isNewCredential = true;

      lmsCredential = await prisma.lmsCredential.create({
        data: {
          generalUserId: userId,
          lmsUsername: creds.username,
          lmsPasswordHash: creds.hashedPassword,
        },
      });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        generalUserId: userId,
        courseId: payment.courseId,
        lmsCredentialId: lmsCredential.id,
        paymentId: payment.id,
        paymentStatus: 'COMPLETED',
        amountPaid: payment.amount,
      },
    });

    // Increment enrollment count
    await prisma.course.update({
      where: { id: payment.courseId },
      data: { enrollmentCount: { increment: 1 } },
    });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId: lmsCredential.id,
        enrollmentId: enrollment.id,
        type: 'ANNOUNCEMENT',
        title: 'Welcome to your new course!',
        message: `You have been enrolled in "${payment.course.title}". Start learning now!`,
      },
    });

    // ─── Send credentials via email ──────────────────────────────────────
    let emailSent = false;
    if (isNewCredential && plainPassword) {
      emailSent = await sendCredentialEmail(
        user.email,
        lmsCredential.lmsUsername,
        plainPassword,
        payment.course.title
      );
    }

    const responseData = {
      enrollment: {
        id: enrollment.id,
        courseTitle: payment.course.title,
        amountPaid: enrollment.amountPaid,
        enrolledAt: enrollment.enrolledAt,
      },
      lmsCredentials: {
        username: lmsCredential.lmsUsername,
        isNew: isNewCredential,
        emailSent,
      },
    };

    // Include plain password only if email was NOT sent (fallback)
    if (isNewCredential && plainPassword && !emailSent) {
      responseData.lmsCredentials.password = plainPassword;
      responseData.lmsCredentials.note = 'Save these credentials! The password cannot be recovered.';
    }

    if (emailSent) {
      responseData.lmsCredentials.note = `Credentials have been sent to ${user.email}. Check your inbox.`;
    }

    return successResponse(res, 'Payment verified and enrollment created successfully.', responseData);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/purchase/history
 * Get user's purchase/enrollment history (generalAuth required)
 */
async function getPurchaseHistory(req, res, next) {
  try {
    const userId = req.user.id;

    const payments = await prisma.payment.findMany({
      where: { generalUserId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            instructorName: true,
          },
        },
      },
    });

    const history = payments.map((p) => ({
      paymentId: p.id,
      course: p.course,
      gateway: p.gateway,
      gatewayOrderId: p.gatewayOrderId,
      status: p.status,
      amount: p.amount,
      currency: p.currency,
      createdAt: p.createdAt,
    }));

    return successResponse(res, 'Purchase history retrieved.', history);
  } catch (error) {
    next(error);
  }
}

module.exports = { createOrder, verifyPayment, getPurchaseHistory };
