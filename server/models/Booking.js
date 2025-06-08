const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  guestName: { type: String, required: true },
  guestEmail: { type: String, required: true },
  guestId: { type: String, required: true }, 
  phone: { type: String, required: true },
  numGuests: { type: Number, required: true },
  propertyGroupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PropertyGroup',
    required: true
  },
  unitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  fullPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  notes: [{
    content: String,
    createdAt: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Booking', bookingSchema);
