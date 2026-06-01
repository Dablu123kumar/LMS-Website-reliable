const express = require('express');
const router = express.Router();
const { generalAuth, adminOnly } = require('../middleware/generalAuth');
const { validate } = require('../middleware/validate');
const adminController = require('../controllers/admin.controller');

// All admin routes require generalAuth + admin role
router.use(generalAuth, adminOnly);

// ─── File Upload Setup with Cloudinary ────────────────────────────────────────
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Sanitize credentials by removing single/double quotes if present
const cloud_name = (process.env.CLOUDINARY_CLOUD_NAME || '').replace(/['"]/g, '');
const api_key = (process.env.CLOUDINARY_API_KEY || '').replace(/['"]/g, '');
const api_secret = (process.env.CLOUDINARY_API_SECRET || '').replace(/['"]/g, '');

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp|gif|mp4|mkv|avi|mov|webm|3gp/;
    const mimetype = /image\/|video\//.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images and videos are allowed.'));
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'auto',
      folder: 'lms_media',
    });

    // Delete the local temporary file
    try {
      fs.unlinkSync(req.file.path);
    } catch (unlinkErr) {
      console.error('Failed to delete temporary local file:', unlinkErr);
    }

    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    
    // Clean up temporary local file if it exists
    try {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (unlinkErr) {
      console.error('Failed to delete temporary local file on error:', unlinkErr);
    }

    res.status(500).json({ success: false, message: error.message || 'Failed to upload to Cloudinary' });
  }
});

// Course management
const createCourseSchema = {
  categoryId: { required: true, type: 'string' },
  title: { required: true, type: 'string', minLength: 3 },
  description: { required: true, type: 'string', minLength: 10 },
  price: { required: true, type: 'number', min: 0 },
  instructorName: { required: true, type: 'string', minLength: 2 },
};

router.get('/courses', adminController.listCourses);
router.post('/courses', validate(createCourseSchema), adminController.createCourse);
router.put('/courses/:id', adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);

// Category management
const createCategorySchema = {
  name: { required: true, type: 'string', minLength: 2 },
};

router.get('/categories', adminController.listCategories);
router.post('/categories', validate(createCategorySchema), adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Live class management
const scheduleLiveClassSchema = {
  courseId: { required: true, type: 'string' },
  title: { required: true, type: 'string', minLength: 3 },
  scheduledAt: { required: true, type: 'string' },
};

router.post('/live-classes', validate(scheduleLiveClassSchema), adminController.scheduleLiveClass);
router.put('/live-classes/:id/start', adminController.startLiveClass);
router.put('/live-classes/:id/end', adminController.endLiveClass);
router.post('/live-classes/:id/notify', adminController.notifyLiveClass);

// Recording management
const addRecordingSchema = {
  courseId: { required: true, type: 'string' },
  title: { required: true, type: 'string', minLength: 3 },
  videoUrl: { required: true, type: 'string' },
};

router.post('/recordings', validate(addRecordingSchema), adminController.addRecording);

// Student management
router.get('/students', adminController.listStudents);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);

// Live class & recording listings
router.get('/live-classes', adminController.listLiveClasses);
router.get('/recordings', adminController.listRecordings);

module.exports = router;
