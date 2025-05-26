const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { createPropertyGroup, getPropertyGroupsByCompany } = require('../controllers/propertyGroupController');

// Manager-only access
router.post(
  '/create',
  authMiddleware,
  roleMiddleware('manager'),
  createPropertyGroup
);

// Shared access: get property groups for a company
router.get(
  '/company/:companyId',
  authMiddleware,
  getPropertyGroupsByCompany
);

module.exports = router;
