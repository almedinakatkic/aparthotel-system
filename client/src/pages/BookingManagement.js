import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../assets/styles/BookingManagement.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const BookingManagement = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [propertyGroups, setPropertyGroups] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredBookings = bookings.filter(b =>
    b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.guestId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredBookings.map(b => ({
      Guest: b.guestName,
      Email: b.email,
      Phone: b.phone,
      'Guest ID': b.guestId,
      Unit: b.unitNumber,
      'Check-in': b.checkIn.split('T')[0],
      'Check-out': b.checkOut.split('T')[0],
      Guests: b.numGuests,
      'Total (KM)': b.totalPrice
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
    XLSX.writeFile(workbook, `bookings_${selectedProperty}.xlsx`);
  };

  return (
    <div className="booking-container">
      <h1>Booking Management</h1>

      <button
        className="new-booking-button"
        style={{ marginLeft: '0rem', marginTop: '1.5rem' }}
        onClick={() => navigate('/create-booking')}
      >
        + Create New Booking
      </button>

      <div className="filter-container" style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
        <label htmlFor="propertySelect" style={{ fontWeight: 'bold' }}>Filter by Property:</label>
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

        {selectedProperty && (
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
          
        )}

              {selectedProperty && (
          <>
            <button onClick={exportToExcel} className="new-booking-button" style={{ 
              width: '150px', 
              fontSize: '13px', 
              height: '35px',
              marginLeft: '0',
              }}>Export to Excel</button>
          </>
        )}
      </div>

      {selectedProperty && filteredBookings.length > 0 ? (
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
      ) : selectedProperty ? (
        <p>No bookings found for this property.</p>
      ) : (
        <p>Please select a property to view bookings.</p>
      )}
    </div>
  );
};

export default BookingManagement;
