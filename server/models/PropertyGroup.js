const mongoose = require('mongoose');

const propertyGroupSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  address: {
    type: String,
    required: function () {
      return this.type === 'hotel';
    }
  },
  type: {
    type: String,
    enum: ['hotel', 'apartment'],
    required: true
  },
  companyShare: { type: Number, default: 30, required: true },
  ownerShare: { type: Number, default: 70, required: true }
});

module.exports = mongoose.model('PropertyGroup', propertyGroupSchema);
