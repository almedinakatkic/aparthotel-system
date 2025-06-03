import React, { useState } from 'react';
import '../assets/styles/roomManagement.css';

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

const RoomManagement = () => {
  const [rooms, setRooms] = useState(initialRooms);
  const [editIndex, setEditIndex] = useState(null);

  const handleChange = (index, field, value, nestedField = null) => {
    const updated = [...rooms];
    if (nestedField) {
      if (!updated[index].guest) updated[index].guest = {};
      updated[index].guest[nestedField] = value;
    } else {
      updated[index][field] = value;
    }
    setRooms(updated);
  };

  const toggleStatus = (index, key) => {
    const updated = [...rooms];
    updated[index][key] = !updated[index][key];

    if (!updated[index][key]) {
      const now = new Date().toISOString().split('T')[0];
      if (key === 'needsCleaning') updated[index].lastCleaned = now;
      if (key === 'needsMaintenance') updated[index].lastMaintenance = now;
    }

    setRooms(updated);
  };

  const handleSave = () => setEditIndex(null);

  return (
    <div className="room-management-container">
      <h2>Room Management</h2>

      <div className="room-list">
        {rooms.map((room, index) => {
          const isEditing = editIndex === index;

          return (
            <div key={index} className={`room-card ${room.isBooked ? 'booked' : 'free'}`}>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={room.roomNumber}
                    onChange={(e) => handleChange(index, 'roomNumber', e.target.value)}
                  />
                  <input
                    type="text"
                    value={room.apartment}
                    onChange={(e) => handleChange(index, 'apartment', e.target.value)}
                  />
                </>
              ) : (
                <h3>Room {room.roomNumber} — {room.apartment}</h3>
              )}

              <p><strong>Status:</strong> {room.isBooked ? 'Booked' : 'Free'}</p>

              {room.isBooked && (
                <div className="guest-info">
                  <h4>Guest Info</h4>
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        placeholder="First Name"
                        value={room.guest?.firstName || ''}
                        onChange={(e) => handleChange(index, null, e.target.value, 'firstName')}
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={room.guest?.lastName || ''}
                        onChange={(e) => handleChange(index, null, e.target.value, 'lastName')}
                      />
                      <input
                        type="text"
                        placeholder="Passport"
                        value={room.guest?.passport || ''}
                        onChange={(e) => handleChange(index, null, e.target.value, 'passport')}
                      />
                      <input
                        type="text"
                        placeholder="Phone"
                        value={room.guest?.phone || ''}
                        onChange={(e) => handleChange(index, null, e.target.value, 'phone')}
                      />
                      <input
                        type="date"
                        value={room.guest?.checkIn || ''}
                        onChange={(e) => handleChange(index, null, e.target.value, 'checkIn')}
                      />
                      <input
                        type="date"
                        value={room.guest?.checkOut || ''}
                        onChange={(e) => handleChange(index, null, e.target.value, 'checkOut')}
                      />
                    </>
                  ) : (
                    <>
                      <p><strong>Name:</strong> {room.guest.firstName} {room.guest.lastName}</p>
                      <p><strong>Passport:</strong> {room.guest.passport}</p>
                      <p><strong>Phone:</strong> {room.guest.phone}</p>
                      <p><strong>Check-in:</strong> {room.guest.checkIn}</p>
                      <p><strong>Check-out:</strong> {room.guest.checkOut}</p>
                    </>
                  )}
                </div>
              )}

              <p><strong>Last Cleaned:</strong> {isEditing ? (
                <input
                  type="date"
                  value={room.lastCleaned}
                  onChange={(e) => handleChange(index, 'lastCleaned', e.target.value)}
                />
              ) : room.lastCleaned}</p>

              <p><strong>Last Maintenance:</strong> {isEditing ? (
                <input
                  type="date"
                  value={room.lastMaintenance}
                  onChange={(e) => handleChange(index, 'lastMaintenance', e.target.value)}
                />
              ) : room.lastMaintenance}</p>

              <div className="room-actions">
                <label>
                  <input
                    type="checkbox"
                    checked={room.needsCleaning}
                    onChange={() => toggleStatus(index, 'needsCleaning')}
                  />
                  Needs Cleaning
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={room.needsMaintenance}
                    onChange={() => toggleStatus(index, 'needsMaintenance')}
                  />
                  Needs Maintenance
                </label>
              </div>

              {isEditing ? (
                <button onClick={handleSave}>Save</button>
              ) : (
                <button onClick={() => setEditIndex(index)}>Edit</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoomManagement;
