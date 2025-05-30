const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  createPropertyGroup,
  getPropertyGroupsByCompany,
  updatePropertyGroup,
  deletePropertyGroup
} = require('../controllers/propertyGroupController');

router.post('/create', authMiddleware, createPropertyGroup);
router.get('/company/:companyId', authMiddleware, getPropertyGroupsByCompany);
router.put('/update/:id', authMiddleware, updatePropertyGroup); 
router.delete('/:id', authMiddleware, deletePropertyGroup);    

module.exports = router;
