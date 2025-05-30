const PropertyGroup = require('../models/PropertyGroup');

exports.createPropertyGroup = async (req, res) => {
  const { name, location, address, type } = req.body;

  if (!name || !location || !address || !type) {
    return res.status(400).json({ message: 'Name, location, address, and type are required' });
  }

  try {
    const newGroup = new PropertyGroup({
      name,
      location,
      address,
      type,
      companyId: req.user.companyId
    });

    await newGroup.save();

    res.status(201).json({ message: 'Property group created', propertyGroup: newGroup });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create property group', error: err.message });
  }
};

exports.getPropertyGroupsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const mongoose = require('mongoose');

    console.log('Raw companyId param:', companyId);

    const groups = await PropertyGroup.find({
      companyId: new mongoose.Types.ObjectId(companyId)
    });

    res.status(200).json(groups);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Failed to fetch property groups', error: err.message });
  }
};

exports.updatePropertyGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedGroup = await PropertyGroup.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedGroup) {
      return res.status(404).json({ message: 'Property group not found' });
    }
    res.status(200).json({ message: 'Property group updated', propertyGroup: updatedGroup });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update property group', error: err.message });
  }
};

exports.deletePropertyGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await PropertyGroup.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Property group not found' });
    }
    res.status(200).json({ message: 'Property group deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete property group', error: err.message });
  }
};


