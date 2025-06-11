import React, { useState } from 'react';
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

const dummyBookings = [
  {
    apartment: 'Apt A101',
    start: new Date('2025-06-16'),
    end: new Date('2025-06-18'),
  },
  {
    apartment: 'Apt B202',
    start: new Date('2025-07-01'),
    end: new Date('2025-07-05'),
  },
  {
    apartment: 'Apt A101',
    start: new Date('2025-06-10'),
    end: new Date('2025-06-12'),
  }
];

const OwnerBookingCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedApartment, setSelectedApartment] = useState('All');

  const uniqueApartments = [
    'All',
    ...Array.from(new Set(dummyBookings.map(b => b.apartment)))
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
    return dummyBookings.find(({ start, end, apartment }) => {
      const matchesApartment = selectedApartment === 'All' || selectedApartment === apartment;
      return matchesApartment && date >= start && date <= end;
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
      {renderCells()}
    </div>
  );
};

export default OwnerBookingCalendar;
