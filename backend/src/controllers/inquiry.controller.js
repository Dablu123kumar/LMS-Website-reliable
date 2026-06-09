const prisma = require('../utils/prismaClient');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { sendInquiryAlertEmail } = require('../utils/mailer');

/**
 * Public: Create a new inquiry (Contact page, bottom form, or counselling card)
 */
async function createInquiry(req, res, next) {
  try {
    const { name, email, phone, subject, course, message, type } = req.body;

    if (!name || !email || !type) {
      return errorResponse(res, 'Name, email, and submission type are required.', 400);
    }

    // Save to database
    const inquiry = await prisma.inquiry.create({
      data: {
        name,
        email,
        phone,
        subject,
        course,
        message,
        type,
        status: 'PENDING'
      }
    });

    // Send Gmail alert to Admin
    // Runs asynchronously so we don't block the API response
    sendInquiryAlertEmail(inquiry).catch(err => {
      console.error('[InquiryController] Email alert failed:', err);
    });

    // Emit Socket.IO event to notify any active connections
    const io = req.app.get('io');
    if (io) {
      io.of('/notifications').emit('admin:newInquiry', inquiry);
    }

    return successResponse(res, 'Inquiry submitted successfully.', inquiry, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: List all inquiries with filters and pagination
 */
async function listInquiries(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { status, type, search } = req.query;

    const where = {};

    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [total, inquiries] = await Promise.all([
      prisma.inquiry.count({ where }),
      prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })
    ]);

    return successResponse(res, 'Inquiries retrieved successfully.', {
      inquiries,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Get count of unread (PENDING) inquiries
 */
async function getUnreadCount(req, res, next) {
  try {
    const count = await prisma.inquiry.count({
      where: { status: 'PENDING' }
    });

    return successResponse(res, 'Unread count retrieved.', { count });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Update inquiry status (PENDING | CONTACTED | RESOLVED)
 */
async function updateInquiryStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'CONTACTED', 'RESOLVED'].includes(status)) {
      return errorResponse(res, 'Invalid status value. Must be PENDING, CONTACTED, or RESOLVED.', 400);
    }

    const inquiry = await prisma.inquiry.findUnique({ where: { id } });
    if (!inquiry) {
      return errorResponse(res, 'Inquiry not found.', 404);
    }

    const updated = await prisma.inquiry.update({
      where: { id },
      data: { status }
    });

    return successResponse(res, `Inquiry status updated to ${status}.`, updated);
  } catch (error) {
    next(error);
  }
}

/**
 * Admin: Delete inquiry
 */
async function deleteInquiry(req, res, next) {
  try {
    const { id } = req.params;

    const inquiry = await prisma.inquiry.findUnique({ where: { id } });
    if (!inquiry) {
      return errorResponse(res, 'Inquiry not found.', 404);
    }

    await prisma.inquiry.delete({ where: { id } });

    return successResponse(res, 'Inquiry deleted successfully.');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createInquiry,
  listInquiries,
  getUnreadCount,
  updateInquiryStatus,
  deleteInquiry
};
