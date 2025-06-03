import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import * as XLSX from 'xlsx';
import '../assets/styles/BookingManagement.css';

const GuestList = () => {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get(`/bookings/property/${user.propertyGroupId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(res.data);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      }
    };
    fetchBookings();
  }, [user.propertyGroupId, token]);

  const filteredBookings = bookings.filter(b =>
    b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.guestId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredBookings.map(b => ({
      Guest: b.guestName,
      Email: b.guestEmail,
      Phone: b.phone,
      'Guest ID': b.guestId,
      Unit: b.unitId?.unitNumber,
      'Check-in': b.checkIn?.slice(0, 10),
      'Check-out': b.checkOut?.slice(0, 10),
      Guests: b.numGuests,
      'Total (KM)': b.fullPrice
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
    XLSX.writeFile(workbook, `guest_bookings_${user.propertyGroupId}.xlsx`);
  };

  return (
    <div className="booking-container">
      <h1>Guest Management</h1>

      <div className="filter-container" style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Search by guest name or ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            minWidth: '240px'
          }}
        />

        <button onClick={exportToExcel} className="new-booking-button" style={{
          width: '150px',
          fontSize: '13px',
          height: '35px',
          marginLeft: '0',
        }}>Export to Excel</button>
      </div>

      {filteredBookings.length > 0 ? (
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
              <th>Total €</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(b => (
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
      ) : (
        <p>No bookings found for this property.</p>
      )}
    </div>
  );
};

export default GuestList;
