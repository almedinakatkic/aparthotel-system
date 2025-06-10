const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const ownerController = require('../controllers/ownerController');


router.get('/:ownerId/dashboard', authMiddleware, ownerController.getOwnerDashboard);
router.get('/:ownerId/apartments', authMiddleware, ownerController.getOwnerApartments);
router.get('/:ownerId/reports', authMiddleware, ownerController.getOwnerReports);
router.get('/:ownerId/apartments/details', authMiddleware, ownerController.getApartmentDetails);
router.get('/:ownerId/bookings', /*authMiddleware,*/ ownerController.getOwnerBookings);





module.exports = router;