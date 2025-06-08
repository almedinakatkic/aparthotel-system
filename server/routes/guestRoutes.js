// routes/guestRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const guestController = require('../controllers/bookingController');

router.post('/:guestId/notes', authMiddleware, guestController.addGuestNote);
router.put('/:guestId', authMiddleware, guestController.updateGuest);
router.delete('/:guestId', authMiddleware, guestController.deleteGuest);
router.get('/:guestId/notes', authMiddleware, guestController.getGuestNotes);
router.delete('/:guestId/notes/:noteId', authMiddleware, guestController.deleteGuestNote);

module.exports = router;