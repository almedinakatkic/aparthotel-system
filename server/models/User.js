const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['manager', 'frontoffice', 'housekeeping', 'owner'],
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  propertyGroupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PropertyGroup'
  },
  unitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit'
  },
  firstLogin: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resetToken: String,
  resetTokenExpiry: Date
});

userSchema.methods.comparePassword = async function (inputPassword) {
  return await require('bcryptjs').compare(inputPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
