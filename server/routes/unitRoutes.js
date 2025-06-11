const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createUnit,
  getAllUnits,
  getUnitsByProperty,
  updateUnit,
  deleteUnit,
  getUnitsByOwner
} = require('../controllers/unitController');

router.post('/create', authMiddleware, createUnit);
router.get('/', authMiddleware, getAllUnits);
router.get('/property/:propertyGroupId', authMiddleware, getUnitsByProperty);
router.put('/update/:unitId', authMiddleware, updateUnit);
router.delete('/:unitId', authMiddleware, deleteUnit); 
router.get('/owner/:ownerId', authMiddleware, getUnitsByOwner);


module.exports = router;
