import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import '../assets/styles/loginStyle.css';

const CreatePropertyGroup = () => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    type: 'hotel',
    companyShare: 30,
    ownerShare: 70
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;
    if (name === 'companyShare' || name === 'ownerShare') {
      updatedValue = Math.max(0, Math.min(100, Number(value))); // clamp between 0–100
    }
    setFormData(prev => ({
      ...prev,
      [name]: updatedValue,
      ...(name === 'type' && value === 'apartment' ? { address: '' } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (Number(formData.companyShare) + Number(formData.ownerShare) !== 100) {
      setError('Company and Owner shares must total 100%');
      return;
    }

    try {
      const payload = {
        ...formData,
        address: formData.type === 'hotel' ? formData.address : ''
      };

      await api.post('/property-group/create', payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMessage('Property group created');
      setFormData({
        name: '',
        location: '',
        address: '',
        type: 'hotel',
        companyShare: 30,
        ownerShare: 70
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Creation failed');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="title" style={{ color: '#193A6F' }}>Add Property</h1>
        <p className="subtitle">Add a new hotel or apartment</p>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <div className="form-group">
          <label>Name</label>
          <input name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input name="location" value={formData.location} onChange={handleChange} required />
        </div>

        {formData.type === 'hotel' && (
          <div className="form-group">
            <label>Address</label>
            <input name="address" value={formData.address} onChange={handleChange} required />
          </div>
        )}

        <div className="form-group">
          <label>Type</label>
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="hotel">Hotel</option>
            <option value="apartment">Apartment</option>
          </select>
        </div>

        <div className="form-group">
          <label>Company Share (%)</label>
          <input
            name="companyShare"
            type="number"
            min="0"
            max="100"
            value={formData.companyShare}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Owner Share (%)</label>
          <input
            name="ownerShare"
            type="number"
            min="0"
            max="100"
            value={formData.ownerShare}
            onChange={handleChange}
            required
          />
        </div>

        <button className="login-button" type="submit">Add</button>
      </form>
    </div>
  );
};

export default CreatePropertyGroup;
