const mongoose = require('mongoose');

const financialReportSchema = new mongoose.Schema({
  propertyGroupId: { type: mongoose.Schema.Types.ObjectId, ref: 'PropertyGroup', required: true },
  month: String,
  year: Number,
  rentalIncome: Number,
  totalExpenses: Number,
  netIncome: Number,
  companyShare: Number,
  ownerShare: Number,
  dateGenerated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FinancialReport', financialReportSchema);
