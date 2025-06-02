import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import '../assets/styles/loginStyle.css';

const CreateUnit = () => {
  const { user, token } = useAuth();
  const [propertyGroups, setPropertyGroups] = useState([]);
  const [formData, setFormData] = useState({
    unitNumber: '',
    floor: '',
    beds: '',
    pricePerNight: '',
    propertyGroupId: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pgRes = await api.get(`/property-group/company/${user.companyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPropertyGroups(pgRes.data);
      } catch (err) {
        setError('Failed to load data');
      }
    };
    fetchData();
  }, [user.companyId, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await api.post('/units/create', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Unit created');
      setFormData({
        unitNumber: '',
        floor: '',
        beds: '',
        pricePerNight: '',
        propertyGroupId: ''
      });
    } catch (err) {
      console.error('CREATE UNIT ERROR:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to create unit');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="title" style={{ color: '#193A6F' }}>Add New Apartment / Unit</h1>
        <p className="subtitle">Link it to a property group</p>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <div className="form-group">
          <label>Property Group</label>
          <select name="propertyGroupId" value={formData.propertyGroupId} onChange={handleChange} required>
            <option value="">Select Property</option>
            {propertyGroups.map(pg => (
              <option key={pg._id} value={pg._id}>{pg.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Unit Number</label>
          <input name="unitNumber" type="number" value={formData.unitNumber} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Floor</label>
          <input name="floor" type="number" value={formData.floor} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Beds</label>
          <input name="beds" type="number" value={formData.beds} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Price per Night</label>
          <input name="pricePerNight" type="number" value={formData.pricePerNight} onChange={handleChange} required />
        </div>

        <button className="login-button" type="submit">Add</button>
      </form>
    </div>
  );
};

export default CreateUnit;
