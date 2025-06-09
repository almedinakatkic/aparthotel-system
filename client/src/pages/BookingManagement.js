import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../assets/styles/BookingManagement.css';
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
  const [noteGuests, setNoteGuests] = useState(new Set());

  useEffect(() => {
    const fetchPropsAndUnits = async () => {
      const [resProps, resUnits] = await Promise.all([
        api.get(`/property-group/company/${user.companyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        api.get(`/units`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setPropertyGroups(resProps.data);
      setUnits(resUnits.data);
    };
    fetchPropsAndUnits();
  }, [user.companyId, token]);

  const fetchBookings = async () => {
    if (!selectedProperty) return;
    const res = await api.get(`/bookings/property/${selectedProperty}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setBookings(res.data);
    const guestsWithNotes = new Set();
    res.data.forEach(b => {
      if (b.notes?.length) guestsWithNotes.add(b.guestId);
    });
    setNoteGuests(guestsWithNotes);
  };

  useEffect(() => {
    fetchBookings();
  }, [selectedProperty, token]);

  const fetchGuestNotes = async (guestId) => {
    const res = await api.get(`/guests/${guestId}/notes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setGuestNotes(res.data);
  };

  const handleEditClick = (b) => {
    setSelectedGuest(b);
    setEditData({
      guestName: b.guestName,
      guestEmail: b.guestEmail,
      guestId: b.guestId,
      phone: b.phone,
      numGuests: b.numGuests,
      unitId: b.unitId?._id || '',
      checkIn: b.checkIn?.slice(0, 10) || '',
      checkOut: b.checkOut?.slice(0, 10) || ''
    });
    setNote('');
    fetchGuestNotes(b.guestId);
    setShowGuestModal(true);
  };

  const handleNoteSubmit = async () => {
    if (!note.trim()) return;
    setIsAddingNote(true);
    try {
      const res = await api.post(`/guests/${selectedGuest.guestId}/notes`, { note }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newNote = res.data;
      setGuestNotes(prev => [...prev, newNote]);
      setNote('');
      setNoteGuests(new Set([...noteGuests, selectedGuest.guestId]));
      setBookings(prev =>
        prev.map(b =>
          b.guestId === selectedGuest.guestId ? { ...b, notes: [...(b.notes || []), newNote] } : b
        )
      );
    } catch (err) {
      console.error("Failed to add note:", err);
      alert("Failed to add note.");
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      setIsDeletingNote(noteId);
      await api.delete(`/guests/${selectedGuest.guestId}/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updated = guestNotes.filter(n => n._id !== noteId);
      setGuestNotes(updated);
      setIsDeletingNote(null);

      if (updated.length === 0) {
        const newSet = new Set(noteGuests);
        newSet.delete(selectedGuest.guestId);
        setNoteGuests(newSet);
      }

      setBookings(prev =>
        prev.map(b =>
          b.guestId === selectedGuest.guestId ? { ...b, notes: updated } : b
        )
      );
    } catch (err) {
      console.error("Note delete failed:", err);
      alert("Failed to delete note.");
      setIsDeletingNote(null);
    }
  };

  const handleEditSubmit = async () => {
    const { guestName, guestEmail, guestId, phone, unitId, checkIn, checkOut, numGuests } = editData;
    if (!guestName || !guestEmail || !guestId || !phone || !unitId || !checkIn || !checkOut || !numGuests) {
      alert("All fields required.");
      return;
    }

    const unit = units.find(u => u._id === unitId);
    if (!unit) return alert("Invalid unit.");
    if (Number(numGuests) > unit.beds) return alert(`This unit allows up to ${unit.beds} guests.`);
    if (new Date(checkIn) >= new Date(checkOut)) return alert("Check-in must be before check-out.");
    if (new Date(checkIn) < new Date().setHours(0, 0, 0, 0)) return alert("Check-in cannot be in the past.");

    const overlaps = await api.get(`/bookings/unit/${unitId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const conflict = overlaps.data.some(b =>
      b._id !== selectedGuest._id &&
      new Date(checkIn) < new Date(b.checkOut) &&
      new Date(checkOut) > new Date(b.checkIn)
    );
    if (conflict) return alert("Booking dates overlap.");

    const res = await api.put(`/guests/${selectedGuest.guestId}`, editData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const updatedBooking = res.data.data;
    updatedBooking.unitId = unit;

    setBookings(prev =>
      prev.map(b =>
        b.guestId === selectedGuest.guestId ? updatedBooking : b
      )
    );
    setShowGuestModal(false);
  };

  const handleGuestDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this guest's booking?")) return;
    try {
      await api.delete(`/guests/${selectedGuest.guestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(prev => prev.filter(b => b.guestId !== selectedGuest.guestId));
      setShowGuestModal(false);
    } catch (err) {
      console.error("Error deleting guest booking:", err);
      alert("Failed to delete booking.");
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
      <button className="new-booking-button" onClick={() => navigate('/create-booking')}>
        + Create New Booking
      </button>
      <div className="filter-container">
        <label style={{ fontWeight: 'bolder' }}>Filter by Property:</label>
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
              <th>Guest</th><th>Email</th><th>Phone</th><th>Guest ID</th>
              <th>Unit</th><th>Check-in</th><th>Check-out</th>
              <th>Guests</th><th>Total (€)</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(b => (
              <tr key={b._id} onClick={() => handleEditClick(b)}>
                <td>{b.guestName}{noteGuests.has(b.guestId) && <span title="Guest has notes"> ⚠️</span>}</td>
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
            <h2>Edit Booking</h2>
            <label>Name</label>
            <input value={editData.guestName} onChange={(e) => setEditData({ ...editData, guestName: e.target.value })} />
            <label>Email</label>
            <input value={editData.guestEmail} onChange={(e) => setEditData({ ...editData, guestEmail: e.target.value })} />
            <label>Guest ID</label>
            <input value={editData.guestId} onChange={(e) => setEditData({ ...editData, guestId: e.target.value })} />
            <label>Phone</label>
            <input value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} />
            <label>Unit</label>
            <select value={editData.unitId} onChange={(e) => setEditData({ ...editData, unitId: e.target.value })}>
              <option value="">Select Unit</option>
              {units
                .filter(u => u.propertyGroupId === selectedProperty || u.propertyGroupId?._id === selectedProperty)
                .map(u => (
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
            <input type="number" min="1" value={editData.numGuests} onChange={(e) => setEditData({ ...editData, numGuests: e.target.value })} />

            <button className="modal-save-button" onClick={handleEditSubmit}>Save Changes</button>
            <button className="modal-delete-button" onClick={handleGuestDelete}>Delete Guest</button>

            <h4>Guest Notes</h4>
            <ul>
              {guestNotes.map(n => (
                <li key={n._id}>
                  <p>{n.content || n.note}</p>
                  <small>{new Date(n.createdAt).toLocaleString()}</small>
                  <button onClick={() => handleDeleteNote(n._id)} disabled={isDeletingNote === n._id}>
                    {isDeletingNote === n._id ? 'Deleting...' : 'Delete'}
                  </button>
                </li>
              ))}
            </ul>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add note..." />
            <button onClick={handleNoteSubmit} disabled={!note.trim() || isAddingNote}>
              {isAddingNote ? 'Adding...' : 'Add Note'}
            </button>
            <button onClick={() => setShowGuestModal(false)} className="modal-close-x">×</button>
            <button className="modal-save-button" style={{ backgroundColor: '#8F291D' }} onClick={() => setShowGuestModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;