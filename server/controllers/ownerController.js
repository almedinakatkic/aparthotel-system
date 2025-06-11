const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Unit = require('../models/Unit');
const PropertyGroup = require('../models/PropertyGroup');
const User = require('../models/User');

// Get owner dashboard data
exports.getOwnerDashboard = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { timeRange } = req.query;

    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!owner.propertyGroupId) {
      return res.status(404).json({ message: 'Owner has no assigned property group.' });
    }

    let startDate, endDate = new Date();
    switch (timeRange) {
      case 'week': startDate = new Date(); startDate.setDate(startDate.getDate() - 7); break;
      case 'month': startDate = new Date(); startDate.setMonth(startDate.getMonth() - 1); break;
      case 'quarter': startDate = new Date(); startDate.setMonth(startDate.getMonth() - 3); break;
      case 'year': startDate = new Date(); startDate.setFullYear(startDate.getFullYear() - 1); break;
      default: startDate = new Date(0);
    }

    const units = await Unit.find({ propertyGroupId: owner.propertyGroupId });
    const unitIds = units.map(unit => unit._id);

    const bookings = await Booking.find({
      unitId: { $in: unitIds },
      checkIn: { $gte: startDate, $lte: endDate }
    }).populate('unitId');

    const totalUnits = unitIds.length;
    const bookedUnits = [...new Set(bookings.map(b => b.unitId._id.toString()))].length;
    const occupancyRate = totalUnits > 0 ? Math.round((bookedUnits / totalUnits) * 100) : 0;
    const revenue = bookings.reduce((sum, b) => sum + (b.fullPrice || 0), 0);
    const expenses = revenue * 0.4;

    const upcomingBookings = await Booking.find({
      unitId: { $in: unitIds },
      checkIn: { $gte: new Date(), $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
    }).limit(5).populate('unitId');

    const maintenanceIssues = [
      { id: 1, room: '101', issue: 'AC not working', priority: 'High', reported: new Date().toISOString() },
      { id: 2, room: '205', issue: 'Leaky faucet', priority: 'Medium', reported: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
    ];

    res.json({
      occupancyRate,
      revenue,
      expenses,
      guestSatisfaction: 4.7,
      upcomingBookings: upcomingBookings.map(b => ({
        id: b._id,
        room: b.unitId.unitNumber,
        guest: b.guestName,
        checkIn: b.checkIn.toISOString().split('T')[0],
        nights: Math.ceil((b.checkOut - b.checkIn) / (1000 * 60 * 60 * 24)),
        revenue: b.fullPrice
      })),
      maintenanceIssues
    });

  } catch (err) {
    console.error('Error in getOwnerDashboard:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard data', error: err.message });
  }
};

// Get owner apartments list
exports.getOwnerApartments = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!owner.propertyGroupId) {
      return res.status(404).json({ message: 'Owner has no property group assigned.' });
    }

    const units = await Unit.find({ propertyGroupId: owner.propertyGroupId }).populate('propertyGroupId');

    const currentBookings = await Booking.find({
      unitId: { $in: units.map(u => u._id) },
      checkIn: { $lte: new Date() },
      checkOut: { $gte: new Date() }
    });

    const bookedUnitIds = currentBookings.map(b => b.unitId.toString());

    const apartments = units.map(unit => ({
      name: `Apt ${unit.unitNumber}`,
      location: unit.propertyGroupId.location,
      address: unit.propertyGroupId.address,
      type: 'apartment',
      isBooked: bookedUnitIds.includes(unit._id.toString())
    }));

    res.json(apartments);

  } catch (err) {
    console.error('Error in getOwnerApartments:', err);
    res.status(500).json({ message: 'Failed to fetch apartments', error: err.message });
  }
};

// Get owner reports
exports.getOwnerReports = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!owner.propertyGroupId) {
      return res.status(404).json({ message: 'Owner has no property group assigned.' });
    }

    const units = await Unit.find({ propertyGroupId: owner.propertyGroupId });

    const reports = units.map((unit, index) => {
      const rentalIncome = Math.floor(Math.random() * 3000) + 1500;
      const maintenance = Math.floor(Math.random() * 400) + 100;
      const cleaning = Math.floor(Math.random() * 200) + 50;
      
      return {
        _id: new mongoose.Types.ObjectId(),
        oReportID: 2000 + index + 1,
        apartment: `Apt ${unit.unitNumber}`,
        date: new Date(),
        ownerIncome: rentalIncome - maintenance - cleaning,
        expenses: { maintenance, cleaning },
        rentalIncome
      };
    });

    res.json(reports);

  } catch (err) {
    console.error('Error in getOwnerReports:', err);
    res.status(500).json({ message: 'Failed to fetch reports', error: err.message });
  }
};

// Get apartment details
exports.getApartmentDetails = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!owner.propertyGroupId) {
      return res.status(404).json({ message: 'Owner has no property group assigned.' });
    }

    const units = await Unit.find({ propertyGroupId: owner.propertyGroupId }).populate('propertyGroupId');

    const bookings = await Booking.find({
      unitId: { $in: units.map(u => u._id) }
    }).sort({ checkIn: -1 });

    const apartmentDetails = units.map(unit => {
      const unitBookings = bookings.filter(b => b.unitId.toString() === unit._id.toString());
      const currentBooking = unitBookings.find(b => 
        new Date(b.checkIn) <= new Date() && new Date(b.checkOut) >= new Date()
      );

      return {
        name: `Apt ${unit.unitNumber}`,
        location: unit.propertyGroupId.location,
        address: unit.propertyGroupId.address,
        type: 'apartment',
        booking: currentBooking ? { 
          from: currentBooking.checkIn.toISOString().split('T')[0],
          to: currentBooking.checkOut.toISOString().split('T')[0]
        } : null,
        lastMaintenance: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        lastCleaning: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
    });

    res.json(apartmentDetails);

  } catch (err) {
    console.error('Error in getApartmentDetails:', err);
    res.status(500).json({ message: 'Failed to fetch apartment details', error: err.message });
  }
};

// Get owner bookings for calendar
exports.getOwnerBookings = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== 'owner') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!owner.propertyGroupId) {
      return res.status(404).json({ message: 'Owner has no property group assigned' });
    }

    const units = await Unit.find({ propertyGroupId: owner.propertyGroupId });
    const unitMap = {};
    units.forEach(u => unitMap[u._id.toString()] = u.unitNumber);

    const bookings = await Booking.find({
      unitId: { $in: units.map(u => u._id) }
    });

    const result = bookings.map(b => ({
      apartment: unitMap[b.unitId.toString()],
      start: b.checkIn.toISOString().split('T')[0],
      end: b.checkOut.toISOString().split('T')[0],
      guest: b.guestName || 'N/A',
      guestEmail: b.guestEmail || ''
    }));

    res.json(result);
  } catch (err) {
    console.error('Error in getOwnerBookings:', err);
    res.status(500).json({ message: 'Failed to fetch bookings', error: err.message });
  }
};
