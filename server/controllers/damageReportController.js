const DamageReport = require('../models/DamageReport');
const path = require('path');
const fs = require('fs');

const createDamageReport = async (req, res) => {
  try {
    const { unitNumber, description, date, reportedBy } = req.body;
    const imagePath = req.file ? req.file.filename : null;

    const newReport = new DamageReport({
      unitNumber,
      description,
      date: new Date(date),
      reportedBy,
      image: imagePath,
      status: 'pending'
    });

    await newReport.save();
    res.status(201).json(newReport);
  } catch (err) {
    console.error('Error creating damage report:', err);
    res.status(500).json({ 
      message: 'Server error creating damage report',
      error: err.message 
    });
  }
};

module.exports = { createDamageReport };