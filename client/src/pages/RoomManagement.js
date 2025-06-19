import { useEffect, useState } from 'react';
import axios from '../api/axios';
import '../App.css'; // Ensure custom-select is loaded
import '../assets/styles/roomManagement.css';
import { useAuth } from '../context/AuthContext';

const RoomManagement = () => {
  const { user, token } = useAuth();
  const [units, setUnits] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchUnits = async () => {
    try {
      const res = await axios.get('/units', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const filtered = res.data.filter(unit => {
        const userProp = user.propertyGroupId?._id || user.propertyGroupId;
        const unitProp = unit.propertyGroupId?._id || unit.propertyGroupId;
        return unitProp === userProp;
      });

      setUnits(filtered);
    } catch (error) {
      console.error('Error fetching units:', error.response?.data || error.message);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get('/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);
    } catch (error) {
      console.error('Error fetching bookings:', error.response?.data || error.message);
    }
  };

  const sendTask = async (unitId, taskType) => {
    try {
      await axios.post(`/housekeeping/notify`, {
        unitId,
        taskType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`${taskType} request sent for unit ${unitId}`);
    } catch (error) {
      console.error(`Failed to send ${taskType} task:`, error.response?.data || error.message);
    }
  };

  const getTodayStatus = (unitId) => {
    return bookings.some(b => {
      const checkIn = new Date(b.checkIn).setHours(0, 0, 0, 0);
      const checkOut = new Date(b.checkOut).setHours(0, 0, 0, 0);
      const todayDate = new Date().setHours(0, 0, 0, 0);
      const bUnitId = typeof b.unitId === 'object' ? b.unitId._id : b.unitId;
      return (
        bUnitId === unitId &&
        checkIn <= todayDate &&
        checkOut > todayDate
      );
    }) ? 'Booked' : 'Free';
  };

  const handleCheckboxChange = (unitId, type) => {
    sendTask(unitId, type);
  };

  useEffect(() => {
    if (!user || !user.propertyGroupId) return;
    fetchUnits();
    fetchBookings();
  }, [user]);

  const filteredUnits = units.filter(unit => {
    const unitStatus = getTodayStatus(unit._id);
    const matchesSearch = unit.unitNumber.toString().includes(searchTerm.trim());
    const matchesStatus = statusFilter === 'All' || unitStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="room-management-page">
      <h1>Apartment Management</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by Apartment Number"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '190px', height: '17px' }}
        />
        <select
          className="custom-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ width: '200px' }}
        >
          <option value="All">All</option>
          <option value="Booked">Booked</option>
          <option value="Free">Free</option>
        </select>
      </div>

      {filteredUnits.length === 0 ? (
        <p style={{ color: 'red' }}>No matching units found.</p>
      ) : (
        <div className="room-grid">
          {filteredUnits.map(unit => (
            <div key={unit._id} className="room-card">
              <h2>Apartment Number: {unit.unitNumber}</h2>
              <p>Status: <strong>{getTodayStatus(unit._id)}</strong></p>
              <p>Last Cleaned: {unit.lastCleaned ? new Date(unit.lastCleaned).toLocaleDateString() : 'N/A'}</p>
              <p>Last Maintenance: {unit.lastMaintenance ? new Date(unit.lastMaintenance).toLocaleDateString() : 'N/A'}</p>
              <label>
                <input
                  type="checkbox"
                  onChange={() => handleCheckboxChange(unit._id, 'cleaning')}
                />
                Needs Cleaning
              </label>
              <label>
                <input
                  type="checkbox"
                  onChange={() => handleCheckboxChange(unit._id, 'maintenance')}
                />
                Needs Maintenance
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
