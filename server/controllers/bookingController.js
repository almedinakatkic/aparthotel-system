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