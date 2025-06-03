import React, { useState } from 'react';
import '../assets/styles/guestList.css';
import { format, differenceInCalendarDays, parseISO } from 'date-fns';

const initialGuests = [
  {
    firstName: 'John',
    lastName: 'Doe',
    passport: 'A123456',
    phone: '+38760111222',
    apartment: 'Apt A101',
    checkIn: '2025-06-01',
    checkOut: '2025-06-07'
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    passport: 'B987654',
    phone: '+38760222333',
    apartment: 'Apt C303',
    checkIn: '2025-06-03',
    checkOut: '2025-06-10'
  },
   {
    firstName: 'Ilma',
    lastName: 'Makarevic',
    passport: 'A123456',
    phone: '+38760111222',
    apartment: 'Apt A101',
    checkIn: '2025-06-01',
    checkOut: '2025-06-07'
  },
  {
    firstName: 'Sara',
    lastName: 'Vatric',
    passport: 'B987654',
    phone: '+38760222333',
    apartment: 'Apt C303',
    checkIn: '2025-06-03',
    checkOut: '2025-06-10'
  }
];

const GuestList = () => {
  const today = new Date();
  const [guests, setGuests] = useState(initialGuests);
  const [editIndex, setEditIndex] = useState(null);

  const handleChange = (index, field, value) => {
    const updated = [...guests];
    updated[index][field] = value;
    setGuests(updated);
  };

  const handleSave = () => {
    setEditIndex(null);
  };

  return (
    <div className="guest-list-container">
      <h2>Current Guests</h2>

      <div className="guest-table-wrapper">
        <table className="guest-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Apartment</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Days Left</th>
              <th>Phone</th>
              <th>Passport</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest, index) => {
              const checkOutDate = parseISO(guest.checkOut);
              const daysLeft = differenceInCalendarDays(checkOutDate, today);
              let status = 'Staying';
              if (daysLeft === 0) status = 'Checking out today';
              if (daysLeft < 0) status = 'Checked out';

              const isEditing = editIndex === index;

              return (
                <tr key={index}>
                  <td>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={guest.firstName}
                          onChange={(e) => handleChange(index, 'firstName', e.target.value)}
                          placeholder="First Name"
                        />
                        <input
                          type="text"
                          value={guest.lastName}
                          onChange={(e) => handleChange(index, 'lastName', e.target.value)}
                          placeholder="Last Name"
                        />
                      </>
                    ) : (
                      `${guest.firstName} ${guest.lastName}`
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={guest.apartment}
                        onChange={(e) => handleChange(index, 'apartment', e.target.value)}
                      />
                    ) : (
                      guest.apartment
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="date"
                        value={guest.checkIn}
                        onChange={(e) => handleChange(index, 'checkIn', e.target.value)}
                      />
                    ) : (
                      format(parseISO(guest.checkIn), 'yyyy-MM-dd')
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="date"
                        value={guest.checkOut}
                        onChange={(e) => handleChange(index, 'checkOut', e.target.value)}
                      />
                    ) : (
                      format(parseISO(guest.checkOut), 'yyyy-MM-dd')
                    )}
                  </td>
                  <td>{daysLeft >= 0 ? daysLeft : 0}</td>
                  <td>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={guest.phone}
                        onChange={(e) => handleChange(index, 'phone', e.target.value)}
                      />
                    ) : (
                      guest.phone
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={guest.passport}
                        onChange={(e) => handleChange(index, 'passport', e.target.value)}
                      />
                    ) : (
                      guest.passport
                    )}
                  </td>
                  <td className={`status ${status.replace(/\s/g, '-').toLowerCase()}`}>{status}</td>
                  <td>
                    {isEditing ? (
                      <button onClick={handleSave}>Save</button>
                    ) : (
                      <button onClick={() => setEditIndex(index)}>Edit</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GuestList;
