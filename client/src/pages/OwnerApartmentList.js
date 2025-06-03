import React, { useState, useEffect } from 'react';
import '../assets/styles/ownerApartmentList.css'; 

const mockData = [
  { name: 'Apt A101', location: 'Sarajevo', address: 'Miljacka Street 10', type: 'apartment', isBooked: true },
  { name: 'Apt B202', location: 'Sarajevo', address: 'Zmaja od Bosne 50', type: 'apartment', isBooked: false },
  { name: 'Apt C303', location: 'Sarajevo', address: 'Titova 12', type: 'apartment', isBooked: true },
];

const OwnerApartmentList = () => {
  const [apartments, setApartments] = useState([]);

  useEffect(() => {
    // Replace this with real API call to fetch user's apartments
    setApartments(mockData);
  }, []);

  return (
    <div className="owner-apartment-container">
      <h2 className="title">My Apartments</h2>

      <div className="apartment-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Address</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {apartments.map((apt, index) => (
              <tr key={index}>
                <td>{apt.name}</td>
                <td>{apt.location}</td>
                <td>{apt.address}</td>
                <td>{apt.type}</td>
                <td>
                  <span className={`status ${apt.isBooked ? 'booked' : 'available'}`}>
                    {apt.isBooked ? 'Booked' : 'Available'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OwnerApartmentList;
