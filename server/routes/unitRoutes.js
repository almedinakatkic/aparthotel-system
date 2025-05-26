const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createUnit,
  getAllUnits,
  getUnitsByProperty,
  updateUnit
} = require('../controllers/unitController');

// POST /api/units/create
router.post('/create', authMiddleware, createUnit);

// GET /api/units (for testing or admin)
router.get('/', authMiddleware, getAllUnits);

// GET /api/units/property/:propertyGroupId
router.get('/property/:propertyGroupId', authMiddleware, getUnitsByProperty);

// PUT /api/units/update/:unitId
router.put('/update/:unitId', authMiddleware, updateUnit);

module.exports = router;
