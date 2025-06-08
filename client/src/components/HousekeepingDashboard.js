import React, { useState } from 'react';
import '../assets/styles/housekeepingDashboard.css';

const HousekeepingDashboard = () => {
  const cleanerName = 'Elma';

  // Combined data from both components
  const initialTasks = [
    {
      room: '101',
      apartment: 'Apt A101',
      type: 'Cleaning',
      date: '2025-06-05',
      time: '10:00',
      status: 'Pending'
    },
    {
      room: '102',
      apartment: 'Apt A101',
      type: 'Maintenance',
      issue: 'Leaking sink in bathroom',
      urgency: 'Medium',
      date: '2025-06-06',
      time: '12:00',
      status: 'Pending'
    }
  ];

  const initialRooms = [
    {
      roomNumber: '101',
      apartment: 'Apt A101',
      isBooked: true,
      guest: {
        firstName: 'John',
        lastName: 'Doe',
        passport: 'A123456',
        phone: '+38760111222',
        checkIn: '2025-06-01',
        checkOut: '2025-06-07'
      },
      lastCleaned: '2025-06-03',
      lastMaintenance: '2025-05-28',
      needsCleaning: false,
      needsMaintenance: false
    },
    {
      roomNumber: '102',
      apartment: 'Apt A101',
      isBooked: false,
      guest: null,
      lastCleaned: '2025-06-01',
      lastMaintenance: '2025-05-20',
      needsCleaning: true,
      needsMaintenance: false
    },
    {
      roomNumber: '201',
      apartment: 'Apt B202',
      isBooked: true,
      guest: {
        firstName: 'Jane',
        lastName: 'Smith',
        passport: 'B987654',
        phone: '+38760222333',
        checkIn: '2025-06-02',
        checkOut: '2025-06-08'
      },
      lastCleaned: '2025-06-02',
      lastMaintenance: '2025-05-25',
      needsCleaning: false,
      needsMaintenance: true
    }
  ];

  const [tasks, setTasks] = useState(initialTasks);
  const [rooms, setRooms] = useState(initialRooms);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'rooms'
  const [showOnlyNeedsCleaning, setShowOnlyNeedsCleaning] = useState(false);

  // Task functions
  const markAsDone = (index) => {
    const updated = [...tasks];
    updated[index].status = 'Done';
    
    // If it's a cleaning task, update the room's lastCleaned date
    if (updated[index].type === 'Cleaning') {
      const roomIndex = rooms.findIndex(r => r.roomNumber === updated[index].room);
      if (roomIndex !== -1) {
        const updatedRooms = [...rooms];
        updatedRooms[roomIndex].lastCleaned = new Date().toISOString().split('T')[0];
        updatedRooms[roomIndex].needsCleaning = false;
        setRooms(updatedRooms);
      }
    }
    
    setTasks(updated);
  };

  // Room functions
  const toggleRoomStatus = (index, key) => {
    const updated = [...rooms];
    updated[index][key] = !updated[index][key];

    if (!updated[index][key]) {
      const now = new Date().toISOString().split('T')[0];
      if (key === 'needsCleaning') updated[index].lastCleaned = now;
      if (key === 'needsMaintenance') updated[index].lastMaintenance = now;
    } else {
      // If marking as needs cleaning, create a new task
      if (key === 'needsCleaning') {
        const newTask = {
          room: updated[index].roomNumber,
          apartment: updated[index].apartment,
          type: 'Cleaning',
          date: new Date().toISOString().split('T')[0],
          time: '09:00',
          status: 'Pending'
        };
        setTasks([...tasks, newTask]);
      }
    }

    setRooms(updated);
  };

  // Filter rooms that need cleaning
  const filteredRooms = showOnlyNeedsCleaning 
    ? rooms.filter(room => room.needsCleaning)
    : rooms;

  return (
    <div className="housekeeping-dashboard">
      <header className="dashboard-header">
        <h1>Housekeeping Dashboard</h1>
        <p>Welcome, {cleanerName}!</p>
      </header>

      <div className="dashboard-controls">
        <div className="tabs">
          <button 
            className={activeTab === 'tasks' ? 'active' : ''}
            onClick={() => setActiveTab('tasks')}
          >
            My Tasks
          </button>
          <button 
            className={activeTab === 'rooms' ? 'active' : ''}
            onClick={() => setActiveTab('rooms')}
          >
            Room Status
          </button>
        </div>

        {activeTab === 'rooms' && (
          <div className="room-filters">
            <label>
              <input
                type="checkbox"
                checked={showOnlyNeedsCleaning}
                onChange={() => setShowOnlyNeedsCleaning(!showOnlyNeedsCleaning)}
              />
              Show only rooms needing cleaning
            </label>
          </div>
        )}
      </div>

      {activeTab === 'tasks' ? (
        <div className="task-section">
          <h2>Your Current Tasks</h2>
          
          {tasks.length === 0 ? (
            <p className="no-tasks">No tasks assigned. Great job!</p>
          ) : (
            <div className="task-list">
              {tasks.map((task, index) => (
                <div key={index} className={`task-card ${task.status === 'Done' ? 'done' : ''}`}>
                  <div className="task-header">
                    <h4>{task.type} — Room {task.room} ({task.apartment})</h4>
                    <span className={`status-badge ${task.status.toLowerCase()}`}>
                      {task.status}
                    </span>
                  </div>
                  
                  <div className="task-details">
                    <p><strong>Scheduled:</strong> {task.date} at {task.time}</p>
                    {task.type === 'Maintenance' && (
                      <>
                        <p><strong>Issue:</strong> {task.issue}</p>
                        <p><strong>Urgency:</strong> 
                          <span className={`urgency-${task.urgency.toLowerCase()}`}>
                            {task.urgency}
                          </span>
                        </p>
                      </>
                    )}
                  </div>
                  
                  {task.status !== 'Done' && (
                    <div className="task-actions">
                      <button 
                        className="complete-btn"
                        onClick={() => markAsDone(index)}
                      >
                        Mark as Done
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="room-status-section">
          <h2>Room Status Overview</h2>
          
          <div className="stats-summary">
            <div className="stat-card">
              <h3>{rooms.filter(r => r.needsCleaning).length}</h3>
              <p>Rooms Need Cleaning</p>
            </div>
            <div className="stat-card">
              <h3>{rooms.filter(r => r.needsMaintenance).length}</h3>
              <p>Rooms Need Maintenance</p>
            </div>
            <div className="stat-card">
              <h3>{rooms.filter(r => r.isBooked).length}</h3>
              <p>Occupied Rooms</p>
            </div>
          </div>
          
          <div className="room-grid">
            {filteredRooms.map((room, index) => (
              <div key={index} className={`room-card ${room.isBooked ? 'booked' : 'free'}`}>
                <h3>Room {room.roomNumber} — {room.apartment}</h3>
                
                <div className="room-status">
                  <p><strong>Status:</strong> {room.isBooked ? 'Occupied' : 'Vacant'}</p>
                  {room.isBooked && (
                    <p className="guest-info">
                      <strong>Guest:</strong> {room.guest.firstName} {room.guest.lastName}
                    </p>
                  )}
                </div>
                
                <div className="room-maintenance">
                  <p>
                    <strong>Last Cleaned:</strong> {room.lastCleaned}
                    {room.needsCleaning && <span className="alert-badge">Needs Cleaning</span>}
                  </p>
                  <p>
                    <strong>Last Maintenance:</strong> {room.lastMaintenance}
                    {room.needsMaintenance && <span className="alert-badge">Needs Maintenance</span>}
                  </p>
                </div>
                
                <div className="room-actions">
                  <button 
                    className={room.needsCleaning ? 'active' : ''}
                    onClick={() => toggleRoomStatus(index, 'needsCleaning')}
                  >
                    {room.needsCleaning ? 'Mark as Cleaned' : 'Request Cleaning'}
                  </button>
                  <button 
                    className={room.needsMaintenance ? 'active' : ''}
                    onClick={() => toggleRoomStatus(index, 'needsMaintenance')}
                  >
                    {room.needsMaintenance ? 'Maintenance Done' : 'Report Issue'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HousekeepingDashboard;