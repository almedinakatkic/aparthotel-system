import React, { useState, useEffect } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  addMonths,
  subMonths,
  isWithinInterval,
  parseISO
} from 'date-fns';
import '../assets/styles/calendar.css';
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await api.get(`/units/property/${propertyGroupId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnits(res.data);
      } catch (err) {
        console.error('Failed to fetch units:', err);
      }
    };

    if (propertyGroupId) fetchUnits();
  }, [propertyGroupId, token]);

  useEffect(() => {
    if (selectedFloor) {
      const filtered = units
        .filter((u) => u.floor === parseInt(selectedFloor))
        .sort((a, b) => a.unitNumber - b.unitNumber);
      setFilteredUnits(filtered);
    } else {
      setFilteredUnits([]);
    }
  }, [selectedFloor, units]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedUnitId) return;
      try {
        const res = await api.get(`/bookings/unit/${selectedUnitId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(res.data);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      }
    };

    fetchBookings();
  }, [selectedUnitId, token]);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 })
  });

  const getBookingsForDay = (day) => {
    return bookings.filter((b) =>
      isWithinInterval(day, {
        start: parseISO(b.checkIn),
        end: parseISO(b.checkOut)
      })
    );
  };

  const handleDayClick = (day) => {
    const matches = getBookingsForDay(day);
    if (matches.length > 0) {
      setSelectedDate(format(day, 'yyyy-MM-dd'));
      setModalOpen(true);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedDate(null);
  };

  const allFloors = [...new Set(units.map((u) => u.floor))].sort((a, b) => a - b);

  return (
    <div className="calendar-container">
      <div className="unit-selector" style={{ marginBottom: '20px' }}>
        <label style={{ color: '#193A6F', fontWeight: 'bolder' }}>Select Floor: </label>
        <select value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)}>
          <option value="">Choose floor</option>
          {allFloors.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        {selectedFloor && (
          <>
            <label style={{ marginLeft: '20px', color: '#193A6F', fontWeight: 'bolder' }}>Select Unit:</label>
            <select value={selectedUnitId} onChange={(e) => setSelectedUnitId(e.target.value)}>
              <option value="">Choose unit</option>
              {filteredUnits.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.unitNumber}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {selectedFloor && selectedUnitId && (
        <>
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
              const isBooked = getBookingsForDay(day).length > 0;
              return (
                <div
                  key={day}
                  className={`calendar-cell ${!isSameMonth(day, currentDate) ? 'outside-month' : ''} ${isBooked ? 'booked' : ''}`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="date-number">{format(day, 'd')}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {modalOpen && (
        <div className="reservation-modal">
          <div className="reservation-modal-content">
            <button className="close-modal" onClick={closeModal}>×</button>
            <h3>Guest Info for {selectedDate}</h3>
            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
              {bookings
                .filter((b) =>
                  isWithinInterval(parseISO(selectedDate), {
                    start: parseISO(b.checkIn),
                    end: parseISO(b.checkOut)
                  })
                )
                .map((b, idx) => (
                  <li key={idx} style={{ marginBottom: '10px' }}>
                    <strong>Name: </strong>{b.guestName || b.guestFullName}<br/>
                    <strong>ID: </strong>{b.guestId || b.guestID}<br/>
                    <strong>Email: </strong>{b.guestEmail}<br/>
                    <strong>Phone: </strong>{b.phone}<br/>
                    <strong>Number of guests: </strong>{b.numGuests}<br/>
                    <strong>Stay: </strong>{format(parseISO(b.checkIn), 'yyyy-MM-dd')} → {format(parseISO(b.checkOut), 'yyyy-MM-dd')}
                  </li>
                ))}
            </ul>
          </div>
        </div>

      )}
    </div>
  );
};

export default Calendar;
