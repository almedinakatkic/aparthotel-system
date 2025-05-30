const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createUnit,
  getAllUnits,
  getUnitsByProperty,
  updateUnit,
  deleteUnit 
} = require('../controllers/unitController');

router.post('/create', authMiddleware, createUnit);
router.get('/', authMiddleware, getAllUnits);
router.get('/property/:propertyGroupId', authMiddleware, getUnitsByProperty);
router.put('/update/:unitId', authMiddleware, updateUnit);
router.delete('/:unitId', authMiddleware, deleteUnit); 

module.exports = router;
