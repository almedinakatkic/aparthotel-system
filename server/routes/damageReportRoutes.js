const express = require('express');
const router = express.Router();
const { createDamageReport } = require('../controllers/damageReportController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const DamageReport = require('../models/DamageReport');

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

router.get('/', async (req, res) => {
  try {
    const reports = await DamageReport.find().sort({ date: -1 }).limit(10);
    res.json(reports);
  } catch (err) {
    console.error('Failed to fetch reports:', err);
    res.status(500).json({ message: 'Server error fetching reports' });
  }
});


module.exports = router;
