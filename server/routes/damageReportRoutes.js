const express = require('express');
const router = express.Router();
const { createDamageReport } = require('../controllers/damageReportController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const DamageReport = require('../models/DamageReport');
const Unit = require('../models/Unit');
const damageReportController = require('../controllers/damageReportController');


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

router.post('/', authMiddleware, upload.single('image'), createDamageReport);

router.get('/', authMiddleware, async (req, res) => {
  try {
    const damageReports = await DamageReport.find()
      .sort({ date: -1 })
      .populate('reportedBy', 'name email');

    res.json(damageReports);
  } catch (err) {
    console.error('Failed to fetch reports:', err);
    res.status(500).json({ message: 'Server error fetching reports' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await DamageReport.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Report not found' });
    res.json({ message: 'Report deleted' });
  } catch (err) {
    console.error('Failed to delete report:', err);
    res.status(500).json({ message: 'Server error deleting report' });
  }
});


router.post('/', authMiddleware, upload.single('image'), damageReportController.createDamageReport);
router.get('/', authMiddleware, damageReportController.getAllDamageReports);

module.exports = router;