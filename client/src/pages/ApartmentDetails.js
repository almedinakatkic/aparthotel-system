import React from 'react';
import '../assets/styles/apartmentDetails.css';

const apartmentList = [
  {
    name: 'Apt A101',
    location: 'Sarajevo',
    address: 'Miljacka Street 10',
    type: 'apartment',
    booking: { from: '2025-06-01', to: '2025-06-10' },
    lastMaintenance: '2025-05-20',
    lastCleaning: '2025-05-30'
  },
  {
    name: 'Apt B202',
    location: 'Sarajevo',
    address: 'Zmaja od Bosne 50',
    type: 'apartment',
    booking: null, 
    lastMaintenance: '2025-05-18',
    lastCleaning: '2025-05-25'
  },
  {
    name: 'Apt C303',
    location: 'Sarajevo',
    address: 'Titova 12',
    type: 'apartment',
    booking: { from: '2025-06-15', to: '2025-06-22' },
    lastMaintenance: '2025-05-25',
    lastCleaning: '2025-05-31'
  }
];

const ApartmentDetails = () => {
  return (
    <div className="apartment-details-wrapper">
      {apartmentList.map((apartment, index) => (
        <div key={index} className="apartment-details-container">
          <h2 className="details-title">{apartment.name} Details</h2>
          <div className="details-grid">
            <div className="detail-item"><strong>Location:</strong> {apartment.location}</div>
            <div className="detail-item"><strong>Address:</strong> {apartment.address}</div>
            <div className="detail-item"><strong>Type:</strong> {apartment.type}</div>
            <div className="detail-item">
              <strong>Status:</strong>{' '}
              {apartment.booking
                ? `${apartment.booking.from} → ${apartment.booking.to}`
                : <span className="status-free">Free</span>
              }
            </div>
            <div className="detail-item"><strong>Last Maintenance:</strong> {apartment.lastMaintenance}</div>
            <div className="detail-item"><strong>Last Cleaning:</strong> {apartment.lastCleaning}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApartmentDetails;
