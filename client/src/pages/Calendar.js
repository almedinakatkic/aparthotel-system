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
  parseISO,
  startOfDay,
  isToday
} from 'date-fns';
import '../assets/styles/ownerCalendar.css';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Calendar = () => {
  const { user, token } = useAuth();
  const propertyGroupId = user?.propertyGroupId;

  const [units, setUnits] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [guestNotesMap, setGuestNotesMap] = useState({});

  // Fetch all units
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await api.get(`/units/property/${propertyGroupId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnits(res.data);
        // Reset filters when new units are loaded
        setSelectedFloor('');
        setSelectedUnitId('');
      } catch (err) {
        console.error('Failed to fetch units:', err);
      }
    };
    if (propertyGroupId) fetchUnits();
  }, [propertyGroupId, token]);

  // Filter units by floor when floor is selected
  useEffect(() => {
    if (selectedFloor) {
      const filtered = units
        .filter((u) => u.floor.toString() === selectedFloor)
        .sort((a, b) => a.unitNumber - b.unitNumber);
      setFilteredUnits(filtered);
      // Reset unit selection when floor changes
      setSelectedUnitId('');
    } else {
      setFilteredUnits(units); // Show all units when no floor is selected
    }
  }, [selectedFloor, units]);

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        let url = '';

        if (selectedUnitId) {
          url = `/bookings/unit/${selectedUnitId}`;
        } else if (selectedFloor) {
          // Get bookings for all units on the selected floor
          const unitIds = filteredUnits.map(u => u._id);
          if (unitIds.length > 0) {
            const res = await api.post('/bookings/by-units', { unitIds }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(res.data);
            return;
          }
          // If no units on this floor, set empty bookings
          setBookings([]);
          return;
        } else {
          url = `/bookings/property/${propertyGroupId}`;
        }

        const res = await api.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(res.data);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      }
    };

    if (propertyGroupId) fetchBookings();
  }, [selectedUnitId, selectedFloor, filteredUnits, propertyGroupId, token]);

  const handleDateClick = async (date) => {
    const bookingsOnDay = bookings.filter((b) => {
      return isWithinInterval(startOfDay(date), {
        start: startOfDay(parseISO(b.checkIn)),
        end: startOfDay(parseISO(b.checkOut))
      });
    });

    if (bookingsOnDay.length > 0) {
      const notesMap = {};
      await Promise.all(
        bookingsOnDay.map(async (b) => {
          const guestId = b.guestId || b.guestID;
          try {
            const res = await api.get(`/guests/${guestId}/notes`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            notesMap[guestId] = res.data;
          } catch (err) {
            console.error(`Failed to fetch notes for guest ${guestId}:`, err);
          }
        })
      );
      setGuestNotesMap(notesMap);
    }

    setSelectedBookings(bookingsOnDay);
    setShowDetails(bookingsOnDay.length > 0);
  };

  const renderHeader = () => (
    <div className="calendar-header">
      <button className="nav-btn" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>❮</button>
      <span className="month-label">{format(currentMonth, 'MMMM yyyy')}</span>
      <button className="nav-btn" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>❯</button>
    </div>
  );

  const renderFilter = () => {
    const allFloors = [...new Set(units.map((u) => u.floor.toString()))].sort((a, b) => parseInt(a) - parseInt(b));

    return (
      <div className="calendar-filter">
        <label>Select Floor: </label>
        <select 
          value={selectedFloor} 
          onChange={(e) => setSelectedFloor(e.target.value)}
        >
          <option value="">All floors</option>
          {allFloors.map((f) => (
            <option key={f} value={f}>Floor {f}</option>
          ))}
        </select>

        <label style={{ marginLeft: '20px' }}>Select Unit:</label>
        <select 
          value={selectedUnitId} 
          onChange={(e) => setSelectedUnitId(e.target.value)}
          disabled={!selectedFloor}
        >
          <option value="">All units</option>
          {filteredUnits.map((u) => (
            <option key={u._id} value={u._id}>
              Unit {u.unitNumber}
            </option>
          ))}
        </select>
      </div>
    );
  };

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

        const dayBookings = bookings.filter((b) => {
          return isWithinInterval(currentDate, {
            start: startOfDay(parseISO(b.checkIn)),
            end: startOfDay(parseISO(b.checkOut))
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
    if (!selectedBookings || selectedBookings.length === 0) return null;

    return (
      <div className="booking-details">
        <h3>Guest Info for {format(new Date(selectedBookings[0].checkIn), 'yyyy-MM-dd')}</h3>
        <p><strong>Total Bookings:</strong> {selectedBookings.length}</p>
        <hr />
        {selectedBookings.map((b, idx) => {
          const guestId = b.guestId || b.guestID;
          const notes = guestNotesMap[guestId] || [];
          return (
            <div key={idx} className="booking-card">
              <p><strong>Name: </strong>{b.guestName || b.guestFullName}</p>
              <p><strong>ID: </strong>{guestId}</p>
              <p><strong>Email: </strong>{b.guestEmail}</p>
              <p><strong>Phone: </strong>{b.phone}</p>
              <p><strong>Guests: </strong>{b.numGuests}</p>
              <p><strong>Stay: </strong>{format(parseISO(b.checkIn), 'yyyy-MM-dd')} → {format(parseISO(b.checkOut), 'yyyy-MM-dd')}</p>
              {notes.length > 0 && (
                <>
                  <strong>Notes:</strong>
                  <ul>
                    {notes.map((n) => (
                      <li key={n._id || n.createdAt}>
                        {n.content || n.note} <small>({format(new Date(n.createdAt), 'yyyy-MM-dd HH:mm')})</small>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          );
        })}
        <button onClick={() => setShowDetails(false)}>Close</button>
      </div>
    );
  };

  return (
    <div className="owner-calendar">
      {renderFilter()}
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      {showDetails && renderBookingDetails()}
    </div>
  );
};

export default Calendar;