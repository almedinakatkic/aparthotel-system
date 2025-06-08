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
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [note, setNote] = useState('');
  const [editData, setEditData] = useState({ guestName: '', guestEmail: '', phone: '' });

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

  const handleNoteSubmit = async () => {
    try {
      await api.post(`/guests/${selectedGuest.guestId}/notes`, { note }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Note added successfully.');
      setNote('');
    } catch (err) {
      alert('Failed to add note.');
    }
  };

  const handleGuestDelete = async () => {
    try {
      await api.delete(`/guests/${selectedGuest.guestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Guest deleted.');
      setShowGuestModal(false);
      setBookings(prev => prev.filter(b => b.guestId !== selectedGuest.guestId));
    } catch (err) {
      alert('Error deleting guest.');
    }
  };

  const handleEditSubmit = async () => {
    try {
      const res = await api.put(`/guests/${selectedGuest.guestId}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Guest updated.');
      setBookings(prev => prev.map(b => b.guestId === selectedGuest.guestId ? { ...b, ...editData } : b));
      setShowGuestModal(false);
    } catch (err) {
      alert('Failed to update guest.');
    }
  };

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

      <button className="new-booking-button" onClick={() => navigate('/create-booking')}>
        + Create New Booking
      </button>

      <div className="filter-container">
        <label htmlFor="propertySelect">Filter by Property:</label>
        <select id="propertySelect" value={selectedProperty} onChange={(e) => setSelectedProperty(e.target.value)}>
          <option value="">Select Property</option>
          {propertyGroups.map(pg => (
            <option key={pg._id} value={pg._id}>{pg.name}</option>
          ))}
        </select>

        {selectedProperty && (
          <>
            <input
              type="text"
              placeholder="Search by guest name or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={exportToExcel}>Export to Excel</button>
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
              <tr
                key={b._id}
                onClick={() => {
                  setSelectedGuest(b);
                  setEditData({ guestName: b.guestName, guestEmail: b.guestEmail, phone: b.phone });
                  setShowGuestModal(true);
                }}
              >
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

      {showGuestModal && selectedGuest && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Guest Options</h2>

            <label>Name</label>
            <input value={editData.guestName} onChange={(e) => setEditData({ ...editData, guestName: e.target.value })} />
            <label>Email</label>
            <input value={editData.guestEmail} onChange={(e) => setEditData({ ...editData, guestEmail: e.target.value })} />
            <label>Phone</label>
            <input value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} />

            <button onClick={handleEditSubmit}>Save Changes</button>
            <button onClick={handleGuestDelete}>Delete Guest</button>

            <hr />
            <label>Add Note</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} />
            <button onClick={handleNoteSubmit}>Add Note</button>

            <button onClick={() => setShowGuestModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
