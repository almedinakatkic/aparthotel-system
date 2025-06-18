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
    type: 'hotel'
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'type' && value === 'apartment' ? { address: '' } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const payload = {
        ...formData,
        address: formData.type === 'hotel' ? formData.address : ''
      };

      await api.post(
        '/property-group/create',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setMessage('Property group created');
      setFormData({ name: '', location: '', address: '', type: 'hotel' });
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
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Hotel Orion"
            required
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Sarajevo"
            required
          />
        </div>

        {formData.type === 'hotel' && (
          <div className="form-group">
            <label>Address</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Marsala Tita 12"
              required={formData.type === 'hotel'}
            />
          </div>
        )}

        <div className="form-group">
          <label>Type</label>
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="hotel">Hotel</option>
            <option value="apartment">Apartment</option>
          </select>
        </div>

        <button className="login-button" type="submit">Add</button>
      </form>
    </div>
  );
};

export default CreatePropertyGroup;