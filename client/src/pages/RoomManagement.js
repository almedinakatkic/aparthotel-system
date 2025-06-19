import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import '../assets/styles/roomManagement.css';

const RoomManagement = () => {
  const { user, token } = useAuth();
  const [units, setUnits] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [propertyGroups, setPropertyGroups] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({
    propertyGroupId: '',
    unitNumber: '',
    floor: '',
    status: 'All'
  });

  const fetchPropertyGroups = async () => {
    try {
      const res = await axios.get(`/property-group/company/${user.companyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPropertyGroups(res.data);
    } catch (error) {
      console.error('Error fetching property groups:', error);
    }
  };

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

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`/tasks/${user.propertyGroupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (error) {
      console.error('Error fetching tasks:', error.response?.data || error.message);
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

  const getLastTaskDate = (unitId, type) => {
    const unitTasks = tasks
      .filter(task =>
        (task.unitId === unitId || task.unitId?._id === unitId) &&
        task.type === type &&
        task.status === 'done'
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return unitTasks.length > 0 ? new Date(unitTasks[0].date).toLocaleDateString() : 'N/A';
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  useEffect(() => {
    if (!user || !user.propertyGroupId) return;
    fetchPropertyGroups();
    fetchUnits();
    fetchBookings();
    fetchTasks();
  }, [user]);

  const filteredUnits = units
    .filter(unit => {
      const unitStatus = getTodayStatus(unit._id);
      const matchesProperty = !filters.propertyGroupId || unit.propertyGroupId?._id === filters.propertyGroupId;
      const matchesUnit = !filters.unitNumber || String(unit.unitNumber).includes(filters.unitNumber.trim());
      const matchesFloor = !filters.floor || String(unit.floor) === filters.floor;
      const matchesStatus = filters.status === 'All' || unitStatus === filters.status;
      return matchesProperty && matchesUnit && matchesFloor && matchesStatus;
    })
    .sort((a, b) => parseInt(a.unitNumber) - parseInt(b.unitNumber));

  return (
    <div className="room-management-page">
      <h1 className="section-title">Room Management</h1>

      <div className="filters-container-rooms">
        <div className="filter-row-rooms">
          <input
            type="text"
            name="unitNumber"
            value={filters.unitNumber}
            onChange={handleFilterChange}
            placeholder="Search by Room Number"
            className="filter-input"
          />
          <input
            type="number"
            name="floor"
            value={filters.floor}
            onChange={handleFilterChange}
            placeholder="Floor"
            className="filter-input"
          />
          <select
            className="filter-select"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="All">All Statuses</option>
            <option value="Booked">Booked</option>
            <option value="Free">Free</option>
          </select>
          <select
            className="filter-select"
            name="propertyGroupId"
            value={filters.propertyGroupId}
            onChange={handleFilterChange}
          >
            <option value="">All Properties</option>
            {propertyGroups.map(pg => (
              <option key={pg._id} value={pg._id}>{pg.name}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredUnits.length === 0 ? (
        <p className="no-units-message">No matching units found.</p>
      ) : (
        <div className="table-container">
          <table className="rooms-table">
            <thead>
              <tr>
                <th>Room Number</th>
                <th>Floor</th>
                <th>Status</th>
                <th>Last Cleaned</th>
                <th>Last Maintenance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnits.map(unit => {
                const status = getTodayStatus(unit._id);
                return (
                  <tr key={unit._id}>
                    <td>{unit.unitNumber}</td>
                    <td>{unit.floor}</td>
                    <td className={`status-cell ${status.toLowerCase()}`}>
                      {status}
                    </td>
                    <td>{getLastTaskDate(unit._id, 'cleaning')}</td>
                    <td>{getLastTaskDate(unit._id, 'maintenance')}</td>
                    <td className="action-cell">
                      <button
                        className="action-button-cleaning"
                        onClick={() => sendTask(unit._id, 'cleaning')}
                      >
                        Cleaning
                      </button>
                      <button
                        className="action-button-maintenance"
                        onClick={() => sendTask(unit._id, 'maintenance')}
                      >
                        Maintenance
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
