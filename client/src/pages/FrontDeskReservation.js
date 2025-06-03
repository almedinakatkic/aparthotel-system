import React, { useState } from 'react';
import '../assets/styles/frontDesk.css';

const apartments = [
  { id: 1, name: 'Apt A101' },
  { id: 2, name: 'Apt B202' },
  { id: 3, name: 'Apt C303' }
];

const FrontDeskReservation = () => {
  const [selectedApartment, setSelectedApartment] = useState('');
  const [guestInfo, setGuestInfo] = useState({
    firstName: '',
    lastName: '',
    passport: '',
    phone: ''
  });
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [status, setStatus] = useState('unbooked');
  const [reservationList, setReservationList] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const reservation = {
      apartment: selectedApartment,
      guest: guestInfo,
      checkIn,
      checkOut,
      status
    };
    setReservationList([...reservationList, reservation]);

    // Reset form
    setSelectedApartment('');
    setGuestInfo({ firstName: '', lastName: '', passport: '', phone: '' });
    setCheckIn('');
    setCheckOut('');
    setStatus('unbooked');
  };

  return (
    <div className="frontdesk-container">
      <h2>Front Desk Reservation</h2>

      <form onSubmit={handleSubmit} className="reservation-form">
        <label>
          Select Apartment:
          <select value={selectedApartment} onChange={(e) => setSelectedApartment(e.target.value)} required>
            <option value="">-- Choose Apartment --</option>
            {apartments.map((apt) => (
              <option key={apt.id} value={apt.name}>{apt.name}</option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend>Guest Info</legend>
          <input
            type="text"
            placeholder="First Name"
            value={guestInfo.firstName}
            onChange={(e) => setGuestInfo({ ...guestInfo, firstName: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={guestInfo.lastName}
            onChange={(e) => setGuestInfo({ ...guestInfo, lastName: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Passport Number"
            value={guestInfo.passport}
            onChange={(e) => setGuestInfo({ ...guestInfo, passport: e.target.value })}
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={guestInfo.phone}
            onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
            required
          />
        </fieldset>

        <label>
          Check-in Date:
          <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
        </label>
        <label>
          Check-out Date:
          <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required />
        </label>

        <label>
          Reservation Status:
          <select value={status} onChange={(e) => setStatus(e.target.value)} required>
            <option value="booked">Booked</option>
            <option value="unbooked">Unbooked</option>
          </select>
        </label>

        <button type="submit">Submit Reservation</button>
      </form>

      <div className="reservation-summary">
        <h3>Reservation Summary</h3>
        {reservationList.length === 0 && <p>No reservations yet.</p>}
        {reservationList.map((res, idx) => (
          <div key={idx} className="reservation-card">
            <p><strong>Apartment:</strong> {res.apartment}</p>
            <p><strong>Guest:</strong> {res.guest.firstName} {res.guest.lastName}</p>
            <p><strong>Passport:</strong> {res.guest.passport}</p>
            <p><strong>Phone:</strong> {res.guest.phone}</p>
            <p><strong>Stay:</strong> {res.checkIn} to {res.checkOut}</p>
            <p><strong>Status:</strong> <span className={res.status === 'booked' ? 'booked' : 'unbooked'}>{res.status}</span></p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FrontDeskReservation;
