const Unit = require('../models/Unit');
const PropertyGroup = require('../models/PropertyGroup');

exports.createUnit = async (req, res) => {
  const { unitNumber, floor, beds, pricePerNight, status, propertyGroupId } = req.body;

  if (!unitNumber || !propertyGroupId || !floor || !beds || !pricePerNight) {
    console.log('❌ Missing fields:', req.body);
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const unit = new Unit({
      unitNumber,
      floor,
      beds,
      pricePerNight,
      propertyGroupId
    });

    await unit.save();
    res.status(201).json({ message: 'Unit created successfully', unit });
  } catch (err) {
    console.error('❌ Save failed:', err.message);
    res.status(500).json({ message: 'Failed to create unit', error: err.message });
  }
};

exports.getAllUnits = async (req, res) => {
  try {
    const units = await Unit.find({}).populate('propertyGroupId');
    res.status(200).json(units);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch units', error: err.message });
  }
};

exports.getUnitsByProperty = async (req, res) => {
  try {
    const { propertyGroupId } = req.params;
    const units = await Unit.find({ propertyGroupId }).populate('propertyGroupId');
    res.status(200).json(units);
  } catch (err) {
    console.error('Failed to fetch units by property:', err.message);
    res.status(500).json({ message: 'Failed to fetch units', error: err.message });
  }
};

exports.updateUnit = async (req, res) => {
  try {
    const { unitId } = req.params;
    const updated = await Unit.findByIdAndUpdate(unitId, req.body, { new: true });
    res.status(200).json({ message: 'Unit updated', unit: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update unit', error: err.message });
  }
};

exports.deleteUnit = async (req, res) => {
  try {
    const { unitId } = req.params;
    const deleted = await Unit.findByIdAndDelete(unitId);
    if (!deleted) {
      return res.status(404).json({ message: 'Unit not found' });
    }
    res.status(200).json({ message: 'Unit deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete unit', error: err.message });
  }
};
