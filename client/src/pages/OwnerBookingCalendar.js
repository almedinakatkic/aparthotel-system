import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth
} from 'date-fns';
import '../assets/styles/ownerCalendar.css';
import { useAuth } from '../context/AuthContext';

const OwnerBookingCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedApartment, setSelectedApartment] = useState('All');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch bookings from backend
  useEffect(() => {
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) throw new Error("No authentication token found.");
      if (!user || !user._id) throw new Error("No logged in user found.");

      const apiUrl = `http://localhost:5000/api/owner/${user._id}/bookings`;
      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // LOG THE RESPONSE HERE:
      console.log("API bookings response:", response.data);

      setBookings(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (user && user._id) {
    fetchBookings();
  }
}, [user]);



  const uniqueApartments = [
    'All',
    ...Array.from(new Set(bookings.map(b => b.apartment)))
  ];

  const handleApartmentChange = (e) => {
    setSelectedApartment(e.target.value);
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

  const getBookingInfo = (date) => {
    return bookings.find(({ start, end, apartment }) => {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const matchesApartment = selectedApartment === 'All' || selectedApartment === apartment;
      return matchesApartment && date >= startDate && date <= endDate;
    }) || null;
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
        const isCurrentMonth = isSameMonth(day, monthStart);
        const booking = getBookingInfo(day);

        days.push(
          <div
            key={day}
            className={`calendar-cell ${!isCurrentMonth ? 'disabled' : booking ? 'booked' : ''}`}
          >
            <div className="date-number">{format(day, 'd')}</div>
            {booking && (
              <div className="booking-info">
                <small>{booking.apartment}</small>
              </div>
            )}
          </div>
        );

        day = addDays(day, 1);
      }

      rows.push(
        <div className="calendar-row" key={day}>
          {days}
        </div>
      );
      days = [];
    }

    return <div>{rows}</div>;
  };

  return (
    <div className="owner-calendar">
      {renderHeader()}
      {renderFilter()}
      {renderDays()}
      {loading && <div className="loading">Loading bookings...</div>}
      {error && <div className="error">Error: {error}</div>}
      {!loading && !error && renderCells()}
    </div>
  );
};

export default OwnerBookingCalendar;
