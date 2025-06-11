import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import * as XLSX from 'xlsx';
import '../assets/styles/BookingManagement.css';

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
          style={{ height: '9px' }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={selectedMonth} style={{ height: '35px' }} onChange={handleMonthChange}>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
          ))}
        </select>
        <button className='new-booking-button' style={{ width: '200px', height: '35px' }} onClick={exportToExcel}>Export to Excel</button>
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
              <th>Total KM</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(b => (
              <tr key={b._id} onClick={() => handleEditClick(b)}>
                <td>{b.guestName}{noteGuests.has(b.guestId) && <span title="Has notes"> ⚠️</span>}</td>
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
        <p>No bookings found for the selected month.</p>
      )}
    </div>
  );
};

export default GuestList;
