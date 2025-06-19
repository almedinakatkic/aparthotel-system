import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths
} from 'date-fns';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import '../assets/styles/ownerCalendar.css';
import { useAuth } from '../context/AuthContext';

const OwnerBookingCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedApartment, setSelectedApartment] = useState('All');
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const { token, user } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get(`/owner/${user.id}/bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = res.data;
        const parsed = data.map(b => ({
          ...b,
          apartment: String(b.apartment),
          start: new Date(b.start),
          end: new Date(b.end)
        }));

        setBookings(parsed);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      }
    };

    if (token && user?.id) {
      fetchBookings();
    }
  }, [token, user]);

  const uniqueApartments = [
    'All',
    ...Array.from(new Set(bookings.map(b => b.apartment)))
  ];

  const handleApartmentChange = (e) => {
    setSelectedApartment(e.target.value);
  };

  const handleDateClick = (date) => {
    const bookingsOnDay = bookings.filter(({ start, end, apartment }) => {
      const matchesApartment = selectedApartment === 'All' || selectedApartment === apartment;
      return matchesApartment && isWithinInterval(startOfDay(date), {
        start: startOfDay(start),
        end: startOfDay(end),
      });
    });

    setSelectedBooking(bookingsOnDay);
    setShowDetails(bookingsOnDay.length > 0);
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
        className="custom-select"
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
        const today = isToday(currentDate);

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
            className={`calendar-cell 
              ${!isCurrentMonth ? 'disabled' : ''}
              ${dayBookings.length > 0 ? 'booked' : ''}
              ${today ? 'today' : ''}`}
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
        <p><strong>Total Bookings:</strong> {selectedBooking.length}</p>
        <hr />
        {selectedBooking.map((b, idx) => (
          <div key={idx} className="booking-card">
            <p><strong>Apartment:</strong> Apt {b.apartment}</p>
            <p><strong>Guest:</strong> {b.guest || 'N/A'}</p>
            <p><strong>Check-In:</strong> {format(new Date(b.start), 'yyyy-MM-dd')}</p>
            <p><strong>Check-Out:</strong> {format(new Date(b.end), 'yyyy-MM-dd')}</p>
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