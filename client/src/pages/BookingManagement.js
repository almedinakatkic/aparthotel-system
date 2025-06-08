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
  const [units, setUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [note, setNote] = useState('');
  const [guestNotes, setGuestNotes] = useState([]);
  const [editData, setEditData] = useState({});
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isDeletingNote, setIsDeletingNote] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      const res = await api.get(`/property-group/company/${user.companyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPropertyGroups(res.data);
    };
    fetchProperties();
  }, [user.companyId, token]);

  useEffect(() => {
    const fetchBookingsAndUnits = async () => {
      if (!selectedProperty) return;
      const [bookingsRes, unitsRes] = await Promise.all([
        api.get(`/bookings/property/${selectedProperty}`, { headers: { Authorization: `Bearer ${token}` } }),
        api.get(`/units/property/${selectedProperty}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setBookings(bookingsRes.data);
      setUnits(unitsRes.data);
    };
    fetchBookingsAndUnits();
  }, [selectedProperty, token]);

  const fetchGuestNotes = async (guestId) => {
    const res = await api.get(`/guests/${guestId}/notes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setGuestNotes(res.data);
  };

  const handleNoteSubmit = async () => {
    if (!note.trim()) return;
    setIsAddingNote(true);
    const res = await api.post(`/guests/${selectedGuest.guestId}/notes`, { note }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setGuestNotes(prev => [...prev, { ...res.data, content: note, createdAt: new Date().toISOString() }]);
    setNote('');
    setIsAddingNote(false);
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    setIsDeletingNote(noteId);
    await api.delete(`/guests/${selectedGuest.guestId}/notes/${noteId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setGuestNotes(prev => prev.filter(n => n._id !== noteId));
    setIsDeletingNote(null);
  };

  const handleGuestDelete = async () => {
    if (!window.confirm('Delete guest?')) return;
    await api.delete(`/guests/${selectedGuest.guestId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setBookings(prev => prev.filter(b => b.guestId !== selectedGuest.guestId));
    setShowGuestModal(false);
  };

  const handleEditSubmit = async () => {
    const {
      guestName, guestEmail, phone, unitId, checkIn, checkOut, numGuests
    } = editData;

    if (!guestName || !guestEmail || !phone || !unitId || !checkIn || !checkOut || !numGuests) {
      alert('Please fill all fields.');
      return;
    }

    const selectedUnit = units.find(u => u._id === unitId);
    if (!selectedUnit) return alert('Invalid unit selected.');
    if (parseInt(numGuests) > selectedUnit.beds) {
      alert(`This unit allows up to ${selectedUnit.beds} guest(s).`);
      return;
    }

    const res = await api.put(`/guests/${selectedGuest.guestId}`, editData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setBookings(prev => prev.map(b => b.guestId === selectedGuest.guestId ? { ...b, ...res.data.data } : b));
    setShowGuestModal(false);
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
      'Check-in': b.checkIn?.slice(0, 10),
      'Check-out': b.checkOut?.slice(0, 10),
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

      <button onClick={() => navigate('/create-booking')} className="new-booking-button">
        + Create New Booking
      </button>

      <div className="filter-container">
        <label>Filter by Property:</label>
        <select value={selectedProperty} onChange={(e) => setSelectedProperty(e.target.value)}>
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
              className="booking-search-input"
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
              <tr key={b._id} onClick={() => {
                setSelectedGuest(b);
                setEditData({
                  guestName: b.guestName,
                  guestEmail: b.guestEmail,
                  phone: b.phone,
                  unitId: b.unitId?._id || '',
                  checkIn: b.checkIn?.slice(0, 10) || '',
                  checkOut: b.checkOut?.slice(0, 10) || '',
                  numGuests: b.numGuests
                });
                fetchGuestNotes(b.guestId);
                setShowGuestModal(true);
              }}>
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

      {showGuestModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Guest</h2>
            <label>Name</label>
            <input value={editData.guestName} onChange={(e) => setEditData({ ...editData, guestName: e.target.value })} />
            <label>Email</label>
            <input value={editData.guestEmail} onChange={(e) => setEditData({ ...editData, guestEmail: e.target.value })} />
            <label>Phone</label>
            <input value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} />
            <label>Unit</label>
            <select value={editData.unitId} onChange={(e) => setEditData({ ...editData, unitId: e.target.value })}>
              <option value="">Select Unit</option>
              {units.map(u => (
                <option key={u._id} value={u._id}>
                  {u.unitNumber} (Floor {u.floor}, {u.beds} bed{u.beds > 1 ? 's' : ''})
                </option>
              ))}
            </select>
            <label>Check-in</label>
            <input type="date" value={editData.checkIn} onChange={(e) => setEditData({ ...editData, checkIn: e.target.value })} />
            <label>Check-out</label>
            <input type="date" value={editData.checkOut} onChange={(e) => setEditData({ ...editData, checkOut: e.target.value })} />
            <label>Guests</label>
            <input type="number" value={editData.numGuests} onChange={(e) => setEditData({ ...editData, numGuests: e.target.value })} min="1" />

            <button onClick={handleEditSubmit} className="modal-save-button">Save Changes</button>
            <button onClick={handleGuestDelete} className="modal-delete-button">Delete Guest</button>

            <hr />
            <h4>Guest Notes</h4>
            <ul>
              {guestNotes.map(n => (
                <li key={n._id}>
                  <p>{n.content}</p>
                  <small>{new Date(n.createdAt).toLocaleString()}</small>
                  <button onClick={() => handleDeleteNote(n._id)} className="delete-note-button">
                    {isDeletingNote === n._id ? 'Deleting...' : 'Delete'}
                  </button>
                </li>
              ))}
            </ul>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add note..." />
            <button onClick={handleNoteSubmit} disabled={!note.trim() || isAddingNote}>
              {isAddingNote ? 'Adding...' : 'Add Note'}
            </button>

            <button onClick={() => setShowGuestModal(false)} className="modal-close-button">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
