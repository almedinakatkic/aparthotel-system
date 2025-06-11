import React, { useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isWithinInterval,
  startOfDay
} from 'date-fns';
import '../assets/styles/ownerCalendar.css';
import { useAuth } from '../context/AuthContext';

const OwnerBookingCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedApartment, setSelectedApartment] = useState('All');
  const [bookings, setBookings] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const { token } = useAuth(); // Or fallback to: const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchBookingsAndUnits = async () => {
      try {
        const bookingsRes = await fetch('http://localhost:5050/api/bookings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const unitsRes = await fetch('http://localhost:5050/api/units', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const bookingsData = await bookingsRes.json();
        const unitsData = await unitsRes.json();

        const parsedBookings = bookingsData.map(b => {
          const matchedUnit = unitsData.find(u => u._id === b.unitId);
          return {
            ...b,
            start: new Date(b.checkIn),
            end: new Date(b.checkOut),
            apartment: matchedUnit?.unitNumber || 'Unknown'
          };
        });

        setBookings(parsedBookings);
        setUnits(unitsData);
      } catch (error) {
        console.error('Failed to fetch bookings or units:', error);
      }
    };

    fetchBookingsAndUnits();
  }, [token]);

  const uniqueApartments = [
    'All',
    ...Array.from(new Set(units.map(u => u.unitNumber)))
  ];

  const handleApartmentChange = (e) => {
    setSelectedApartment(e.target.value);
  };

  const getBookingInfo = (date) => {
    const day = startOfDay(date);
    return bookings.find(({ start, end, apartment }) => {
      const matchesApartment = selectedApartment === 'All' || selectedApartment === apartment;
      return matchesApartment && isWithinInterval(day, {
        start: startOfDay(start),
        end: startOfDay(end),
      });
    }) || null;
  };

  const handleDateClick = (date) => {
    const bookingsOnDay = bookings.filter(({ start, end, apartment }) => {
      const matchesApartment = selectedApartment === 'All' || selectedApartment === apartment;
      return matchesApartment && isWithinInterval(startOfDay(date), {
        start: startOfDay(start),
        end: startOfDay(end),
      });
    });

    if (bookingsOnDay.length > 0) {
      setSelectedBooking(bookingsOnDay); // sada niz
      setShowDetails(true);
    } else {
      setSelectedBooking([]);
      setShowDetails(false);
    }
  };


  const renderHeader = () => (
    <div className="calendar-header">
      <button className="nav-btn" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>❮</button>
      <span className="month-label">{format(currentMonth, 'MMMM yyyy')}</span>
      <button className="nav-btn" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>❯</button>
    </div>
  );

  const renderFilter = () => (
    <div className="calendar-filter">
      <label htmlFor="apartment-filter">Filter by Apartment:</label>
      <select
        id="apartment-filter"
        value={selectedApartment}
        onChange={handleApartmentChange}
      >
        {uniqueApartments.map((apt) => (
          <option key={apt} value={apt}>{apt}</option>
        ))}
      </select>
    </div>
  );

  const renderDays = () => {
    const days = [];
    const dateFormat = 'EEE';
    let startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="day-name">
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }
    return <div className="calendar-days">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDate = startOfDay(day);
        const isCurrentMonth = isSameMonth(currentDate, monthStart);

        // Filtriraj sve bookinge koji padaju na ovaj dan
        const dayBookings = bookings.filter(({ start, end, apartment }) => {
          const matchesApartment = selectedApartment === 'All' || selectedApartment === apartment;
          return matchesApartment && isWithinInterval(currentDate, {
            start: startOfDay(start),
            end: startOfDay(end),
          });
        });

        days.push(
          <div
            key={currentDate.toISOString()}
            className={`calendar-cell ${!isCurrentMonth ? 'disabled' : dayBookings.length > 0 ? 'booked' : ''}`}
            onClick={() => handleDateClick(currentDate)}
          >
            <div className="date-number">{format(currentDate, 'd')}</div>
            {dayBookings.length > 0 && (
              <div className="booking-info">
                <span>🏨 {dayBookings.length}</span>
              </div>
            )}
          </div>
        );

        day = addDays(day, 1);
      }

      rows.push(
        <div className="calendar-row" key={`row-${day.toISOString()}`}>
          {days}
        </div>
      );
      days = [];
    }

    return <div>{rows}</div>;
  };


  const renderBookingDetails = () => {
    if (!selectedBooking || selectedBooking.length === 0) return null;

    return (
      <div className="booking-details">
        <h3>Bookings for Selected Date</h3>
        {selectedBooking.map((b, idx) => (
          <div key={idx} className="booking-card">
            <p><strong>Apartment:</strong> {b.apartment}</p>
            <p><strong>Guest:</strong> {b.guestName} ({b.guestEmail})</p>
            <p><strong>Check-In:</strong> {format(new Date(b.checkIn), 'yyyy-MM-dd')}</p>
            <p><strong>Check-Out:</strong> {format(new Date(b.checkOut), 'yyyy-MM-dd')}</p>
            <hr />
          </div>
        ))}
        <button onClick={() => setShowDetails(false)}>Close</button>
      </div>
    );
  };


  return (
    <div className="owner-calendar">
      {renderHeader()}
      {renderFilter()}
      {renderDays()}
      {renderCells()}
      {showDetails && renderBookingDetails()}
    </div>
  );
};

export default OwnerBookingCalendar;
