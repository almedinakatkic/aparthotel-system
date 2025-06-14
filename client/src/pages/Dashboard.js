import React, { useEffect, useState } from 'react';
import '../assets/styles/dashboardStyle.css';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resBookings, resUnits] = await Promise.all([
          api.get('/bookings', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/units', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setBookings(resBookings.data);
        setUnits(resUnits.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) return <div>Loading dashboard...</div>;

  // ----- Stats calculations -----
  const todayCheckIn = bookings.filter(b => b.checkIn?.slice(0, 10) === today).length;
  const todayCheckOut = bookings.filter(b => b.checkOut?.slice(0, 10) === today).length;
  const totalGuests = bookings.reduce((sum, b) => sum + (b.numGuests || 0), 0);

  const occupiedUnitIds = new Set(bookings.map(b => b.unitId?._id || b.unitId));
  const totalUnits = units.length;
  const totalOccupiedRooms = occupiedUnitIds.size;
  const totalAvailableRooms = totalUnits - totalOccupiedRooms;

  const cleanUnits = units.filter(u => u.status === 'clean');
  const dirtyUnits = units.filter(u => u.status === 'dirty');

  const availableClean = cleanUnits.filter(u => !occupiedUnitIds.has(u._id)).length;
  const availableDirty = dirtyUnits.filter(u => !occupiedUnitIds.has(u._id)).length;
  const occupiedClean = cleanUnits.filter(u => occupiedUnitIds.has(u._id)).length;
  const occupiedDirty = dirtyUnits.filter(u => occupiedUnitIds.has(u._id)).length;

  // ----- Graph data (bookings per month) -----
  const bookingsPerMonth = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(0, i).toLocaleString('default', { month: 'short' }),
    count: 0
  }));

  bookings.forEach(b => {
    const monthIndex = new Date(b.checkIn).getMonth();
    bookingsPerMonth[monthIndex].count += 1;
  });

  return (
    <div className="dashboard">
      {/* Overview Section */}
      <div className="overview">
        <h3 className='overview-heading'>Overview</h3>
        <div className="overview-stats">
          <div>Today's Check-in <span>{todayCheckIn}</span></div>
          <div>Today's Check-out <span>{todayCheckOut}</span></div>
          <div>Total Guests <span>{totalGuests}</span></div>
          <div>Total Available Rooms <span>{totalAvailableRooms}</span></div>
          <div>Total Occupied Rooms <span>{totalOccupiedRooms}</span></div>
        </div>
      </div>

      {/* Room Status Section */}
      <div className="room-status">
        <h3>Room Status</h3>
        <div className="status-blocks-container">
          <div className="status-block">
            <p id='available-occupied-rooms'>Occupied Rooms: {totalOccupiedRooms}</p>
            <p>Clean: {occupiedClean}</p>
            <p>Dirty: {occupiedDirty}</p>
          </div>
          <div className="status-block">
            <p id='available-occupied-rooms'>Available Rooms: {totalAvailableRooms}</p>
            <p>Clean: {availableClean}</p>
            <p>Dirty: {availableDirty}</p>
          </div>
        </div>
        <div className="divider" />
      </div>

      {/* Bottom Sections */}
      <div className="bottom-sections">
        <div className="occupancy">
          <div className="occupancy-header">
            <h3>Occupancy Statistics</h3>
            <button className="monthly-btn">📅 Monthly</button>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={bookingsPerMonth}>
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="feedback">
          <h3>Customers Feedback</h3>
          <ul>
            <li>Jane ⭐⭐⭐⭐</li>
            <hr />
            <li>Mark ⭐⭐</li>
            <hr />
            <li>Lily ⭐⭐⭐</li>
            <p>Room cleaning could be better.</p>
            <hr />
            <li>Jack ⭐⭐⭐⭐⭐</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
