import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import api from '../api/axios';
import '../App.css'; // ensure custom-select is loaded
import '../assets/styles/guestList.css';
import { useAuth } from '../context/AuthContext';

const GuestList = () => {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [units, setUnits] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [editData, setEditData] = useState({});
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [note, setNote] = useState('');
  const [guestNotes, setGuestNotes] = useState([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isDeletingNote, setIsDeletingNote] = useState(null);
  const [noteGuests, setNoteGuests] = useState(new Set());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resBookings, resUnits] = await Promise.all([
          api.get(`/bookings/property/${user.propertyGroupId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          api.get(`/units`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setBookings(resBookings.data);
        setUnits(resUnits.data);

        const guestsWithNotes = new Set();
        resBookings.data.forEach(b => {
          if (b.notes?.length) guestsWithNotes.add(b.guestId);
        });
        setNoteGuests(guestsWithNotes);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, [user.propertyGroupId, token]);

  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value));
  };

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
    } catch {
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
    } catch {
      alert("Failed to delete note.");
      setIsDeletingNote(null);
    }
  };

  const handleEditSubmit = async () => {
    const { guestName, guestEmail, guestId, phone, unitId, checkIn, checkOut, numGuests } = editData;
    if (!guestName || !guestEmail || !guestId || !phone || !unitId || !checkIn || !checkOut || !numGuests) return alert("All fields required.");
    const unit = units.find(u => u._id === unitId);
    if (!unit) return alert("Invalid unit.");
    if (Number(numGuests) > unit.beds) return alert(`Max ${unit.beds} guests allowed.`);
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
    } catch {
      alert("Failed to delete booking.");
    }
  };

  const filteredBookings = bookings.filter(b => {
    const guestNameMatch = b.guestName?.toLowerCase().includes(searchTerm.toLowerCase());
    const guestIdMatch = b.guestId?.toLowerCase().includes(searchTerm.toLowerCase());
    const monthMatch = new Date(b.checkIn).getMonth() === selectedMonth;
    return (guestNameMatch || guestIdMatch) && monthMatch;
  });

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
      <div className="filter-container" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search by name or ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className="custom-select" value={selectedMonth} onChange={handleMonthChange}>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
          ))}
        </select>
        <button className='new-booking-button' style={{ width: '200px', height: '35px' }} onClick={exportToExcel}>Export to Excel</button>
      </div>

      {/* rest unchanged */}

      {showGuestModal && selectedGuest && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Booking</h2>
            {/* input fields */}
            <label>Unit</label>
            <select className="custom-select" value={editData.unitId} onChange={(e) => setEditData({ ...editData, unitId: e.target.value })}>
              <option value="">Select Unit</option>
              {units
                .filter(u => u.propertyGroupId === user.propertyGroupId || u.propertyGroupId?._id === user.propertyGroupId)
                .map(u => (
                  <option key={u._id} value={u._id}>
                    {u.unitNumber} (Floor {u.floor}, {u.beds} bed{u.beds > 1 ? 's' : ''})
                  </option>
                ))}
            </select>
            {/* rest unchanged */}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestList;