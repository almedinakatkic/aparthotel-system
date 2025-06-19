const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  unitNumber: {
    type: Number,
    required: true
  },
  floor: {
    type: Number,
    required: true
  },
  beds: {
    type: Number,
    required: true
  },
  pricePerNight: {
    type: Number,
    required: true
  },
  address: {
    type: String
    // address is optional, validation is handled in controller
  },
  propertyGroupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PropertyGroup',
    required: true
  },
  lastCleaned: {
    type: Date,
    default: null
  },
  lastMaintenance: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Unit', unitSchema);
