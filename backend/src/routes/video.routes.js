const express = require('express');
const router = express.Router();
const { lmsAuth } = require('../middleware/lmsAuth');
const videoController = require('../controllers/video.controller');

// Signed URL generation requires LMS auth
router.get('/stream/:id', lmsAuth, videoController.getSignedStreamUrl);

// Video playback via signed token (no auth header needed, token in query)
router.get('/play', videoController.playVideo);

module.exports = router;
