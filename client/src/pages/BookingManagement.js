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
  const [guestNotes, setGuestNotes] = useState([]);
  const [editData, setEditData] = useState({ guestName: '', guestEmail: '', phone: '' });
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isDeletingNote, setIsDeletingNote] = useState(null);

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

  const fetchGuestNotes = async (guestId) => {
    try {
      const res = await api.get(`/guests/${guestId}/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGuestNotes(res.data);
    } catch (err) {
      console.error('Failed to fetch guest notes:', err);
    }
  };

  const handleNoteSubmit = async () => {
    if (!note.trim()) return;

    setIsAddingNote(true);
    try {
      const res = await api.post(`/guests/${selectedGuest.guestId}/notes`, { note }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updated = await api.get(`/guests/${selectedGuest.guestId}/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGuestNotes(updated.data);
      setNote('');
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    setIsDeletingNote(noteId);
    try {
      await api.delete(`/guests/${selectedGuest.guestId}/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updated = await api.get(`/guests/${selectedGuest.guestId}/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGuestNotes(updated.data);
    } catch (err) {
      console.error('Failed to delete note:', err);
    } finally {
      setIsDeletingNote(null);
    }
  };

  const handleEditSubmit = async () => {
    try {
      await api.put(`/guests/${selectedGuest.guestId}`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Guest updated.');
      setBookings(prev =>
        prev.map(b =>
          b.guestId === selectedGuest.guestId ? { ...b, ...editData } : b
        )
      );
      setShowGuestModal(false);
    } catch (err) {
      console.error('Failed to update guest:', err);
      alert('Failed to update guest.');
    }
  };

  const handleGuestDelete = async () => {
    if (window.confirm('Are you sure you want to delete this guest?')) {
      try {
        await api.delete(`/guests/${selectedGuest.guestId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Guest deleted.');
        setShowGuestModal(false);
        setBookings(prev => prev.filter(b => b.guestId !== selectedGuest.guestId));
      } catch (err) {
        console.error('Error deleting guest:', err);
        alert('Error deleting guest.');
      }
    }
  };

  const filteredBookings = bookings.filter(b =>
    b.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.guestId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredBookings.map(b => ({
      Guest: b.guestName,
      Email: b.guestEmail,
      Phone: b.phone,
      'Guest ID': b.guestId,
      Unit: b.unitId?.unitNumber,
      'Check-in': b.checkIn?.split('T')[0],
      'Check-out': b.checkOut?.split('T')[0],
      Guests: b.numGuests,
      'Total (€)': b.fullPrice
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
          <>
            <input
              type="text"
              className="booking-search-input"
              placeholder="Search by guest name or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="export-button" onClick={exportToExcel}>Export to Excel</button>
          </>
        )}
      </div>

      {selectedProperty && filteredBookings.length > 0 && (
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
                  setEditData({
                    guestName: b.guestName || '',
                    guestEmail: b.guestEmail || '',
                    phone: b.phone || ''
                  });
                  setNote('');
                  fetchGuestNotes(b.guestId);
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
      )}

      {showGuestModal && selectedGuest && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Guest Options</h2>

            <label>Name</label>
            <input
              value={editData.guestName}
              onChange={(e) => setEditData({ ...editData, guestName: e.target.value })}
            />
            <label>Email</label>
            <input
              value={editData.guestEmail}
              onChange={(e) => setEditData({ ...editData, guestEmail: e.target.value })}
            />
            <label>Phone</label>
            <input
              value={editData.phone}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
            />

            <button className='modal-save-button' onClick={handleEditSubmit}>Save Changes</button>
            <button onClick={handleGuestDelete}>Delete Guest</button>

            <hr />

            <div className="guest-notes">
              <h4>Guest Notes</h4>
              {guestNotes.length > 0 ? (
                <ul>
                  {guestNotes.map((n) => (
                    <li key={n._id}>
                      <p>{n.content}</p>
                      {n.createdAt && <small>{new Date(n.createdAt).toLocaleString()}</small>}
                      <button
                        onClick={() => handleDeleteNote(n._id)}
                        disabled={isDeletingNote === n._id}
                        className="delete-note-button"
                      >
                        {isDeletingNote === n._id ? 'Deleting...' : 'Delete'}
                      </button>
                      <hr />
                    </li>
                  ))}
                </ul>
              ) : (
                <p id='no-notes'>No notes available.</p>
              )}
            </div>

            <label>Add Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter your note here..."
            />
            <button
              onClick={handleNoteSubmit}
              disabled={isAddingNote || !note.trim()}
            >
              {isAddingNote ? 'Adding...' : 'Add Note'}
            </button>

            <button className="modal-close-button" onClick={() => setShowGuestModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
