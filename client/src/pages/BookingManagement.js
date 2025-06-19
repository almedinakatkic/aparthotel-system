import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import api from '../api/axios';
import '../App.css';
import '../assets/styles/BookingManagement.css';
import { useAuth } from '../context/AuthContext';

const BookingManagement = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [propertyGroups, setPropertyGroups] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [bookings, setBookings] = useState([]);
  const [units, setUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

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
  };

  useEffect(() => {
    fetchBookings();
  }, [selectedProperty, token]);

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) || b.guestId?.toLowerCase().includes(searchTerm.toLowerCase());
    const monthMatch = new Date(b.checkIn).getMonth() === Number(selectedMonth);
    return matchesSearch && monthMatch;
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
      'Total (€)': b.fullPrice
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
    XLSX.writeFile(workbook, `bookings_${selectedProperty}.xlsx`);
  };

  return (
    <div className="rooms-container">
      <h1 className="title">Booking Management</h1>
      <button className="unit-button" onClick={() => navigate('/create-booking')} style={{ marginBottom: '1rem' }}>
        + Create New Booking
      </button>

      {/* Filter Row with inline labels and Export */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          className="filter-container"
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            maxWidth: '1100px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <label style={{ fontWeight: 'bold', color: '#193A6F' }}>Property:</label>
            <select
              className="custom-select"
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
            >
              <option value="">Select</option>
              {propertyGroups.map((pg) => (
                <option key={pg._id} value={pg._id}>
                  {pg.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <label style={{ fontWeight: 'bold', color: '#193A6F' }}>Month:</label>
            <select
              className="custom-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <label style={{ fontWeight: 'bold', color: '#193A6F' }}>Search:</label>
            <input
              type="text"
              placeholder="Guest name or ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="custom-input"
            />
          </div>

          <button className="export-button" onClick={exportToExcel}>
            Export to Excel
          </button>
        </div>
      </div>

      {/* Booking Table */}
      {selectedProperty && filteredBookings.length > 0 && (
        <div className="rooms-table-container">
          <table className="rooms-table">
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
                <th>Total (€)</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
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
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
