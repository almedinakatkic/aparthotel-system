import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import '../assets/styles/ownerApartmentList.css';
import { useAuth } from '../context/AuthContext';

const OwnerApartmentList = ({ refreshFlag }) => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchUnitsWithStatus = async () => {
      try {
        if (!token || !user?.id) {
          setError("User not authenticated.");
          setLoading(false);
          return;
        }

        const unitsRes = await api.get(`/units/owner/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const allUnits = unitsRes.data;

        const unitsWithStatus = await Promise.all(
          allUnits.map(async (unit) => {
            try {
              const bookingsRes = await api.get(`/bookings/unit/${unit._id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });

              const today = new Date();
              const isBooked = bookingsRes.data.some(b =>
                new Date(b.checkIn) <= today && new Date(b.checkOut) >= today
              );

              return { ...unit, isBooked };
            } catch (bookingErr) {
              console.error(`Error fetching bookings for unit ${unit._id}:`, bookingErr);
              return { ...unit, isBooked: false };
            }
          })
        );

        setUnits(unitsWithStatus);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUnitsWithStatus();
  }, [user, token, refreshFlag]);

  return (
    <div className="owner-apartment-container">
      <h2 className="title">My Units</h2>

      {loading && <div className="loading">Loading units...</div>}
      {error && <div className="error">Error: {error}</div>}

      {!loading && !error && units.length === 0 && (
        <div>No units found.</div>
      )}

      {!loading && !error && units.length > 0 && (
        <div className="apartment-table">
          <table>
            <thead>
              <tr>
                <th>Unit Number</th>
                <th>Floor</th>
                <th>Beds</th>
                <th>Price per Night</th>
                <th>Property Name</th>
                <th>Location</th>
                <th>Address</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit, index) => (
                <tr key={index}>
                  <td>{unit.unitNumber}</td>
                  <td>{unit.floor}</td>
                  <td>{unit.beds}</td>
                  <td>{unit.pricePerNight} €</td>
                  <td>{unit.propertyGroupId?.name || 'N/A'}</td>
                  <td>{unit.propertyGroupId?.location || 'N/A'}</td>
                  <td>{unit.propertyGroupId?.address || 'N/A'}</td>
                  <td>
                    <span className={`status ${unit.isBooked ? 'booked' : 'available'}`}>
                      {unit.isBooked ? 'Booked' : 'Available'}
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
