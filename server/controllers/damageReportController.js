const DamageReport = require('../models/DamageReport');
const path = require('path');
const fs = require('fs');

const createDamageReport = async (req, res) => {
  try {
    const { unitNumber, description, date, reportedBy } = req.body;
    const image = req.file ? req.file.filename : null;

    const newReport = new DamageReport({
      unitNumber,
      description,
      date,
      reportedBy,
      image
    });

    await newReport.save();
    res.status(201).json(newReport);
  } catch (err) {
    console.error('Error creating damage report:', err);
    res.status(500).json({ message: 'Server error creating damage report' });
  }
};
module.exports = { createDamageReport };
