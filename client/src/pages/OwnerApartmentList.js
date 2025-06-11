import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/styles/ownerApartmentList.css';
import { useAuth } from '../context/AuthContext'; // Adjust path as needed

const OwnerApartmentList = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // Get current user from auth context

  useEffect(() => {
    console.log("useEffect fired, user is:", user);
    const fetchApartments = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setError("No authentication token found. Please login again.");
          setLoading(false);
          return;
        }
        if (!user || !user.id) {
          setError("No logged in user found. Please login.");
          setLoading(false);
          return;
        }

        const apiUrl = `http://localhost:5050/api/owner/${user.id}/apartments`;

        const response = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setApartments(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.id) {
      fetchApartments();
    } else {
      setLoading(false);
      setError("No logged in user.");
    }
  }, [user]);

  return (
    <div className="owner-apartment-container">
      <h2 className="title">My Apartments</h2>

      {loading && <div className="loading">Loading apartments...</div>}
      {error && <div className="error">Error: {error}</div>}

      {!loading && !error && apartments.length === 0 && (
        <div>No apartments found.</div>
      )}

      {!loading && !error && apartments.length > 0 && (
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
      )}
    </div>
  );
};

export default OwnerApartmentList;
