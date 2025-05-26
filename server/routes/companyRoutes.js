const express = require('express');
const router = express.Router();
const Company = require('../models/Company');

router.post('/create', async (req, res) => {
  try {
    const company = new Company({ name: 'Prestige Management' });
    await company.save();
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create company', error });
  }
});

module.exports = router;
