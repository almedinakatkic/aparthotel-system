import React, { useState } from 'react';
import '../assets/styles/guests.css';

const Guests = () => {
  const [guests, setGuests] = useState([
    {
      reservationId: 1,
      guestName: 'John Doe',
      roomNumber: '201',
      numberOfGuests: 3,
      totalAmount: 250,
      checkIn: '2025-04-15',
      checkOut: '2025-04-20'
    },
    {
      reservationId: 2,
      guestName: 'Jane Smith',
      roomNumber: '202',
      numberOfGuests: 2,
      totalAmount: 200,
      checkIn: '2025-04-18',
      checkOut: '2025-04-22'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);

  const filteredGuests = guests.filter(guest =>
    guest.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.guestName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="guests-container">
      <h1>Guests Management</h1>
      
      <div className="guests-header">
        <div className="date-filters">
          <div className="date-input">
            <label>Check in</label>
            <input type="date" />
          </div>
          <div className="date-input">
            <label>Check out</label>
            <input type="date" />
          </div>
        </div>
        
        <div className="search-add">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by room number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            className="add-booking-btn"
            onClick={() => setShowBookingForm(true)}
          >
            Add booking
          </button>
        </div>
      </div>

      <div className="guests-table-container">
        <table className="guests-table">
          <thead>
            <tr>
              <th>Reservation ID</th>
              <th>Guest Name</th>
              <th>Room Number</th>
              <th>Number of Guests</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuests.map((guest, index) => (
              <tr key={index}>
                <td>{guest.reservationId}</td>
                <td>{guest.guestName}</td>
                <td>{guest.roomNumber}</td>
                <td>{guest.numberOfGuests}</td>
                <td>${guest.totalAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showBookingForm && (
        <div className="booking-modal">
          <div className="modal-content">
            <h3>Add New Booking</h3>
            {/* Booking form would go here */}
            <button onClick={() => setShowBookingForm(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guests;