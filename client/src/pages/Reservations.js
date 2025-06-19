import { useEffect, useState } from 'react';
import api from '../api/axios';
import '../App.css'; // Needed for custom-select
import '../assets/styles/createBooking.css';
import { useAuth } from '../context/AuthContext';

const Reservations = () => {
  const { user, token } = useAuth();
  const [units, setUnits] = useState([]);
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestId: '',
    phone: '',
    numGuests: '',
    unitId: '',
    checkIn: '',
    checkOut: ''
  });
  const [fullPrice, setFullPrice] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
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
    fetchUnits();
  }, [token]);

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
    setFormData(prev => ({ ...prev, [name]: name === 'numGuests' ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      setError('Check-in date cannot be in the past.');
      return;
    }
    if (checkOutDate <= checkInDate) {
      setError('Check-out must be after check-in.');
      return;
    }

    try {
      await api.post('/bookings/create', {
        ...formData,
        propertyGroupId: user.propertyGroupId?._id || user.propertyGroupId
      }, {
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
        numGuests: '',
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
      <h1>Create a Reservation</h1>

      <form onSubmit={handleSubmit} className="booking-form">
        <h2>Guest Info</h2>
        <input type="text" name="guestName" value={formData.guestName} onChange={handleChange} placeholder="Full Name" required />
        <input type="email" name="guestEmail" value={formData.guestEmail} onChange={handleChange} placeholder="Email" required />
        <input type="text" name="guestId" value={formData.guestId} onChange={handleChange} placeholder="Guest ID" required />
        <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" required />
        <input type="number" name="numGuests" value={formData.numGuests} onChange={handleChange} min="1" placeholder="Number of Guests" required />

        <h2>Booking Info</h2>
        <select className="custom-select" name="unitId" value={formData.unitId} onChange={handleChange} required>
          <option value="">Select Unit</option>
          {units
            .filter(u => {
              const userPropertyId = user.propertyGroupId?._id || user.propertyGroupId;
              const unitPropId = u.propertyGroupId?._id || u.propertyGroupId;
              return unitPropId === userPropertyId;
            })
            .sort((a, b) => Number(a.unitNumber) - Number(b.unitNumber))
            .map(unit => (
              <option key={unit._id} value={unit._id}>
                {unit.unitNumber}
              </option>
            ))}
        </select>

        <input
          type="date"
          name="checkIn"
          value={formData.checkIn}
          onChange={handleChange}
          min={new Date().toISOString().split('T')[0]}
          required
        />
        <input
          type="date"
          name="checkOut"
          value={formData.checkOut}
          onChange={handleChange}
          min={formData.checkIn || new Date().toISOString().split('T')[0]}
          required
        />

        <p><strong>Total Price:</strong> {fullPrice} KM</p>

        <button type="submit">Book</button>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
};

export default Reservations;