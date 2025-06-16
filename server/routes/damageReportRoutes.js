const express = require('express');
const router = express.Router();
const { createDamageReport } = require('../controllers/damageReportController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Upload config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  createDamageReport
);

module.exports = router;
