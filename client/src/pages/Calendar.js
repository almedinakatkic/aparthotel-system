import React, { useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  addMonths,
  subMonths
} from 'date-fns';
import '../assets/styles/calendar.css';
import FrontDeskReservation from '../pages/FrontDeskReservation'; // ⬅️ Your existing form

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState([
    { apartment: 'Apt A101', guest: 'John Doe', date: '2025-06-04' },
    { apartment: 'Apt C303', guest: 'Jane Smith', date: '2025-06-15' }
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 })
  });

  const getReservationsForDay = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return reservations.filter((res) => res.date === dateStr);
  };

  const handleDayClick = (day) => {
    setSelectedDate(format(day, 'yyyy-MM-dd'));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedDate(null);
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}>{'<'}</button>
        <h2>{format(currentDate, 'MMMM yyyy')}</h2>
        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}>{'>'}</button>
      </div>

      <div className="calendar-grid">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="calendar-day-name">{day}</div>
        ))}

        {days.map((day) => {
          const reservationsForDay = getReservationsForDay(day);
          return (
            <div
              key={day}
              className={`calendar-cell ${!isSameMonth(day, currentDate) ? 'outside-month' : ''}`}
              onClick={() => handleDayClick(day)}
            >
              <div className="date-number">{format(day, 'd')}</div>
              {reservationsForDay.map((res, idx) => (
                <div key={idx} className="reservation-badge">
                  {res.apartment}: {res.guest}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Modal for FrontDeskReservation */}
      {modalOpen && (
        <div className="reservation-modal">
          <div className="reservation-modal-content">
            <button className="close-modal" onClick={closeModal}>×</button>
            <FrontDeskReservation />
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
