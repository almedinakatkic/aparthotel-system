const FinancialReport = require('../models/FinancialReport');

exports.getReportsByProperty = async (req, res) => {
  try {
    const { propertyGroupId } = req.params;
    const reports = await FinancialReport.find({ propertyGroupId }).sort({ year: -1, month: -1 });
    res.json(reports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createReport = async (req, res) => {
  try {
    const {
      propertyGroupId,
      month,
      year,
      rentalIncome,
      totalExpenses,
      netIncome,
      companyShare,
      ownerShare
    } = req.body;

    const existing = await FinancialReport.findOne({ propertyGroupId, month, year });
    if (existing) return res.status(400).json({ message: 'Report already exists for this month/year.' });

    const report = new FinancialReport({
      propertyGroupId,
      month,
      year,
      rentalIncome,
      totalExpenses,
      netIncome,
      companyShare,
      ownerShare
    });

    await report.save();
    res.status(201).json({ message: 'Report sent successfully', report });
  } catch (err) {
    console.error('Error sending report:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const reports = await FinancialReport.find()
      .populate('propertyGroupId', 'name')
      .sort({ year: -1, month: -1 });
    res.json(reports);
  } catch (err) {
    console.error('Error fetching all financial reports:', err);
    res.status(500).json({ message: 'Server error fetching all reports' });
  }
};
