const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const bookingController = require('../controllers/bookingController');

router.post('/create', authMiddleware, bookingController.createBooking);
router.get('/unit/:unitId', authMiddleware, bookingController.getBookingsByUnit);
router.get('/property/:propertyGroupId', authMiddleware, bookingController.getBookingsByProperty);

module.exports = router;
