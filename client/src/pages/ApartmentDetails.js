import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/styles/apartmentDetails.css';
import { useAuth } from '../context/AuthContext';

const ApartmentDetails = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("No authentication token found.");
          setLoading(false);
          return;
        }

        if (!user || !user.id) {
          setError("No logged-in user found.");
          setLoading(false);
          return;
        }

        const res = await axios.get(`http://localhost:5050/api/owner/${user.id}/apartments/details`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setApartments(res.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchDetails();
  }, [user]);

  return (
    <div className="apartment-details-wrapper">

      {loading && <div>Loading apartment details...</div>}
      {error && <div className="error">Error: {error}</div>}
      
      {!loading && !error && apartments.length === 0 && (
        <div>No apartment details found.</div>
      )}

      {!loading && !error && apartments.map((apartment, index) => (
        <div key={index} className="apartment-details-container">
          <h3 className="details-title">{apartment.name} Details</h3>
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
