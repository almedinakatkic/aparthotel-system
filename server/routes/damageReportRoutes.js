const express = require('express');
const router = express.Router();
const { createDamageReport } = require('../controllers/damageReportController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const DamageReport = require('../models/DamageReport');
const Unit = require('../models/Unit');

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
    // Get all units owned by this user
    const ownedUnits = await Unit.find({ 
      propertyGroupId: { $in: req.user.managedProperties } 
    });
    
    // Extract unit numbers from owned units
    const unitNumbers = ownedUnits.map(unit => unit.unitNumber);
    
    // Find damage reports for these units
    const damageReports = await DamageReport.find({ 
      unitNumber: { $in: unitNumbers }
    })
    .sort({ date: -1 })
    .limit(10)
    .populate('reportedBy', 'name email');

    res.json(damageReports);
  } catch (err) {
    console.error('Failed to fetch reports:', err);
    res.status(500).json({ message: 'Server error fetching reports' });
  }
});

module.exports = router;