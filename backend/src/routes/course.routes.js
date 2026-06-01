const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');

// All routes are public
router.get('/', courseController.getAllCourses);
router.get('/categories', courseController.getCategories);
router.get('/category/:slug', courseController.getCoursesByCategory);
router.get('/:slug', courseController.getCourseBySlug);

module.exports = router;
