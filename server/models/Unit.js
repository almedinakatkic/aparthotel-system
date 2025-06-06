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
  propertyGroupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PropertyGroup',
    required: true
  }
});

module.exports = mongoose.model('Unit', unitSchema);
