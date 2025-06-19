const express = require('express');
const router = express.Router();
const OwnerNote = require('../models/OwnerNote');
const authMiddleware = require('../middleware/authMiddleware');

// GET all notes for specific owner
router.get('/:ownerId/notes', authMiddleware, async (req, res) => {
  try {
    const { ownerId } = req.params;
    const notes = await OwnerNote.find({ ownerId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching notes' });
  }
});

// POST a new note
router.post('/:ownerId/notes', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const { ownerId } = req.params;

    const newNote = await OwnerNote.create({
      ownerId,
      content,
      createdAt: new Date()
    });

    res.status(201).json(newNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating note' });
  }
});

// DELETE a note by ID
router.delete('/:ownerId/notes/:noteId', authMiddleware, async (req, res) => {
  try {
    const { ownerId, noteId } = req.params;

    const deleted = await OwnerNote.findOneAndDelete({ _id: noteId, ownerId });
    if (!deleted) return res.status(404).json({ message: 'Note not found' });

    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting note' });
  }
});

module.exports = router;
