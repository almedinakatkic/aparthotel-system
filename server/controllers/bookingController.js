const Booking = require('../models/Booking');
const Unit = require('../models/Unit');


exports.createBooking = async (req, res) => {
  try {
    const {
      guestName,
      guestEmail,
      guestId,
      phone,
      numGuests,
      unitId,
      propertyGroupId,
      checkIn,
      checkOut
    } = req.body;

    if (
      !guestName || !guestEmail || !guestId || !phone || !numGuests ||
      !unitId || !propertyGroupId || !checkIn || !checkOut
    ) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const unit = await Unit.findById(unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    const overlaps = await Booking.findOne({
      unitId,
      $or: [
        { checkIn: { $lt: new Date(checkOut) }, checkOut: { $gt: new Date(checkIn) } }
      ]
    });

    if (overlaps) {
      return res.status(409).json({ message: 'This unit is already booked for the selected dates.' });
    }

    if (numGuests > unit.beds) {
      return res.status(400).json({ message: `This unit allows up to ${unit.beds} guest(s).` });
    }

    const nights = Math.ceil(
      (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
    );
    const fullPrice = nights * unit.pricePerNight;

    const booking = new Booking({
      guestName,
      guestEmail,
      guestId,
      phone,
      numGuests,
      unitId,
      propertyGroupId,
      checkIn,
      checkOut,
      fullPrice
    });

    await booking.save();
    res.status(201).json({ message: 'Booking successful', booking });
  } catch (err) {
    console.error('Booking creation failed:', err.message);
    res.status(500).json({ message: 'Booking failed', error: err.message });
  }
};

exports.getBookingsByProperty = async (req, res) => {
  try {
    const { propertyGroupId } = req.params;
    const bookings = await Booking.find({ propertyGroupId })
      .populate('unitId')
      .populate('propertyGroupId');
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: err.message });
  }
};

exports.getBookingsByUnit = async (req, res) => {
  try {
    const { unitId } = req.params;
    const bookings = await Booking.find({ unitId })
      .populate('unitId')
      .populate('propertyGroupId');
    res.status(200).json(bookings);
  } catch (err) {
    console.error('Fetch bookings failed:', err.message);
    res.status(500).json({ message: 'Failed to fetch bookings', error: err.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('unitId'); 
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: err.message });
  }
};

exports.getMonthlyIncomeByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const bookings = await Booking.aggregate([
      {
        $lookup: {
          from: 'propertygroups',
          localField: 'propertyGroupId',
          foreignField: '_id',
          as: 'property'
        }
      },
      { $unwind: '$property' },
      {
        $match: { 'property.companyId': new mongoose.Types.ObjectId(companyId) }
      },
      {
        $group: {
          _id: {
            property: '$property.name',
            month: { $month: '$checkIn' },
            year: { $year: '$checkIn' }
          },
          totalIncome: { $sum: '$fullPrice' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch monthly income.' });
  }
};

exports.getGeneralReport = async (req, res) => {
  const { day, month, year } = req.query;

  try {
    const match = {};
    const label = [];

    if (year) {
      match.checkIn = { ...match.checkIn, $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31T23:59:59`) };
      label.push(year);
    }

    if (month) {
      const paddedMonth = month.toString().padStart(2, '0');
      match.checkIn = {
        $gte: new Date(`${year}-${paddedMonth}-01`),
        $lte: new Date(`${year}-${paddedMonth}-31T23:59:59`)
      };
      label.push(`Month ${paddedMonth}`);
    }

    if (day) {
      const paddedMonth = month.toString().padStart(2, '0');
      const paddedDay = day.toString().padStart(2, '0');
      match.checkIn = {
        $gte: new Date(`${year}-${paddedMonth}-${paddedDay}T00:00:00`),
        $lte: new Date(`${year}-${paddedMonth}-${paddedDay}T23:59:59`)
      };
      label.push(`Day ${paddedDay}`);
    }

    const bookings = await Booking.find(match);
    const totalIncome = bookings.reduce((sum, b) => sum + (b.fullPrice || 0), 0);

    let type = 'Yearly';
    if (day && month && year) type = 'Daily';
    else if (month && year) type = 'Monthly';

    res.json({
      type,
      label: label.reverse().join(', '),
      totalIncome
    });

  } catch (err) {
    console.error("Error generating general report:", err);
    res.status(500).json({ message: 'Failed to generate report' });
  }
};

exports.addGuestNote = async (req, res) => {
  try {
    const { guestId } = req.params;
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ message: 'Note content is required' });
    }

    const newNote = { content: note, createdAt: new Date() };

    const booking = await Booking.findOneAndUpdate(
      { guestId },
      { $push: { notes: newNote } },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    const addedNote = booking.notes[booking.notes.length - 1];

    res.status(200).json(addedNote);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to add note',
      error: err.message
    });
  }
};

exports.getGuestNotes = async (req, res) => {
  try {
    const { guestId } = req.params;

    const booking = await Booking.findOne({ guestId }, { notes: 1 });

    if (!booking) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    res.status(200).json(booking.notes || []);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch guest notes', error: err.message });
  }
};

exports.deleteGuestNote = async (req, res) => {
  const { guestId, noteId } = req.params;

  try {
    const booking = await Booking.findOne({ guestId });
    if (!booking) return res.status(404).json({ message: 'Guest not found' });

    const noteIndex = booking.notes.findIndex(n => n._id.toString() === noteId);
    if (noteIndex === -1) return res.status(404).json({ message: 'Note not found' });

    booking.notes.splice(noteIndex, 1);
    await booking.save();

    res.status(200).json({ message: 'Note deleted' });
  } catch (err) {
    console.error('Delete note error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateGuest = async (req, res) => {
  try {
    const { guestId } = req.params;
    const updateData = req.body;

    const unit = await Unit.findById(updateData.unitId);
    if (!unit) return res.status(404).json({ message: 'Unit not found' });

    const nights = Math.ceil(
      (new Date(updateData.checkOut) - new Date(updateData.checkIn)) / (1000 * 60 * 60 * 24)
    );
    updateData.fullPrice = nights * unit.pricePerNight;

    const booking = await Booking.findOneAndUpdate(
      { guestId },
      updateData,
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Guest updated successfully',
      data: booking
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update guest',
      error: err.message
    });
  }
};

exports.deleteGuest = async (req, res) => {
  try {
    const { guestId } = req.params;

    const result = await Booking.deleteOne({ guestId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Guest deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete guest',
      error: err.message
    });
  }
};