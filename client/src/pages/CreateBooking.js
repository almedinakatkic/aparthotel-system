import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import '../assets/styles/createBooking.css';

const CreateBooking = () => {
  const { user, token } = useAuth();
  const [propertyGroups, setPropertyGroups] = useState([]);
  const [units, setUnits] = useState([]);
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestId: '',
    phone: '',
    numGuests: 1,
    propertyGroupId: '',
    unitId: '',
    checkIn: '',
    checkOut: ''
  });
  const [fullPrice, setFullPrice] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPropertyGroups = async () => {
      try {
        const res = await api.get(`/property-group/company/${user.companyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPropertyGroups(res.data);
      } catch (err) {
        console.error('Failed to fetch property groups:', err);
      }
    };

    const fetchUnits = async () => {
      try {
        const res = await api.get('/units', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnits(res.data);
      } catch (err) {
        console.error('Failed to fetch units:', err);
      }
    };

    fetchPropertyGroups();
    fetchUnits();
  }, [user.companyId, token]);

  useEffect(() => {
    const selectedUnit = units.find(u => u._id === formData.unitId);
    if (selectedUnit && formData.checkIn && formData.checkOut) {
      const nights = Math.ceil(
        (new Date(formData.checkOut) - new Date(formData.checkIn)) / (1000 * 60 * 60 * 24)
      );
      setFullPrice(nights * selectedUnit.pricePerNight);
    } else {
      setFullPrice(0);
    }
  }, [formData, units]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['numGuests'].includes(name)) {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else if (name === 'propertyGroupId') {
      setFormData(prev => ({ ...prev, propertyGroupId: value, unitId: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/bookings/create', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setMessage('Booking created successfully');
      setError('');
      setFormData({
        guestName: '',
        guestEmail: '',
        guestId: '',
        phone: '',
        numGuests: 1,
        propertyGroupId: formData.propertyGroupId,
        unitId: '',
        checkIn: '',
        checkOut: ''
      });
      setFullPrice(0);
    } catch (err) {
      console.error("Booking failed:", err.response?.data || err.message);
      setError(err.response?.data?.message || 'Booking failed');
      setMessage('');
    }
  };

  return (
    <div className="front-desk-page">
      <h1>Create Booking</h1>

      <form onSubmit={handleSubmit} className="booking-form">
        <h2>Guest Info</h2>
        <input type="text" name="guestName" value={formData.guestName} onChange={handleChange} placeholder="Full Name" required />
        <input type="email" name="guestEmail" value={formData.guestEmail} onChange={handleChange} placeholder="Email" required />
        <input type="text" name="guestId" value={formData.guestId} onChange={handleChange} placeholder="Guest ID" required />
        <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" required />
        <input type="number" name="numGuests" value={formData.numGuests} onChange={handleChange} min="1" placeholder="Number of Guests" required />

        <h2>Booking Info</h2>
        <select name="propertyGroupId" value={formData.propertyGroupId} onChange={handleChange} required>
          <option value="">Select Property</option>
          {propertyGroups.map(pg => (
            <option key={pg._id} value={pg._id}>{pg.name}</option>
          ))}
        </select>

        <select name="unitId" value={formData.unitId} onChange={handleChange} required>
          <option value="">Select Unit</option>
          {units
            .filter(u => {
              const pgId = u.propertyGroupId?._id || u.propertyGroupId;
              return pgId === formData.propertyGroupId;
            })
            .map(unit => (
              <option key={unit._id} value={unit._id}>
                {unit.unitNumber} (Floor {unit.floor}, {unit.beds} bed{unit.beds > 1 ? 's' : ''})
              </option>
            ))}
        </select>

        <input type="date" name="checkIn" value={formData.checkIn} onChange={handleChange} required />
        <input type="date" name="checkOut" value={formData.checkOut} onChange={handleChange} required />

        <p><strong>Total Price:</strong> {fullPrice} KM</p>

        <button type="submit">Book</button>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default CreateBooking;
