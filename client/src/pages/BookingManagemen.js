import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../assets/styles/guests.css';

const BookingManagement = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [propertyGroups, setPropertyGroups] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await api.get(`/property-group/company/${user.companyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPropertyGroups(res.data);
      } catch (err) {
        console.error('Failed to fetch property groups:', err);
      }
    };
    fetchProperties();
  }, [user.companyId, token]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedProperty) return;
      try {
        const res = await api.get(`/bookings/property/${selectedProperty}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(res.data);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      }
    };
    fetchBookings();
  }, [selectedProperty, token]);

  return (
    <div className="rooms-container">
      <h1>Booking Management</h1>

      <button
          className="login-button"
          style={{ marginLeft: '0rem', marginTop: '1.5rem' }}
          onClick={() => navigate('/create-booking')}
        >
          + Create New Booking
        </button>

      <div className="filter-container">
        <label htmlFor="propertySelect" style={{ fontWeight: 'bolder' }}>Filter by Property:</label>
        <select
          id="propertySelect"
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
        >
          <option value="">Select Property</option>
          {propertyGroups.map(pg => (
            <option key={pg._id} value={pg._id}>{pg.name}</option>
          ))}
        </select>

      </div>

      {selectedProperty && bookings.length > 0 ? (
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Guest ID</th>
              <th>Unit</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Guests</th>
              <th>Total (KM)</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b._id}>
                <td>{b.guestName}</td>
                <td>{b.guestEmail}</td>
                <td>{b.phone}</td>
                <td>{b.guestId}</td>
                <td>{b.unitId?.unitNumber}</td>
                <td>{b.checkIn?.slice(0, 10)}</td>
                <td>{b.checkOut?.slice(0, 10)}</td>
                <td>{b.numGuests}</td>
                <td>{b.fullPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : selectedProperty ? (
        <p>No bookings found for this property.</p>
      ) : (
        <p>Please select a property to view bookings.</p>
      )}
    </div>
  );
};

export default BookingManagement;
