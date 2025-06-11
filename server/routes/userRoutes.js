const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { createUser, getAllUsersInCompany, updateUser, deleteUser } = require('../controllers/userController');

router.post('/create', authMiddleware, roleMiddleware('manager'), createUser);
router.get('/company/:companyId', authMiddleware, getAllUsersInCompany);
router.put('/:id', authMiddleware, roleMiddleware('manager'), updateUser);
router.delete('/:id', authMiddleware, roleMiddleware('manager'), deleteUser);

module.exports = router;