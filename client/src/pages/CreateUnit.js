import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import '../assets/styles/CreateProperty.css';

const CreateUnit = () => {
  const { user, token } = useAuth();
  const [propertyGroups, setPropertyGroups] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [propertyType, setPropertyType] = useState('');

  const [formData, setFormData] = useState({
    unitNumber: '',
    floor: '',
    beds: '',
    pricePerNight: '',
    address: '',
    propertyGroupId: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get(`/property-group/company/${user.companyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPropertyGroups(res.data);
      } catch (err) {
        setError('Failed to load property groups');
      }
    };
    fetchGroups();
  }, [user.companyId]);

  const handlePropertyChange = (e) => {
    const propertyId = e.target.value;
    setSelectedPropertyId(propertyId);
    setFormData({ ...formData, propertyGroupId: propertyId });

    const selected = propertyGroups.find(pg => pg._id === propertyId);
    if (selected) {
      setPropertyType(selected.type);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const payload = {
        ...formData,
        address: propertyType === 'apartment' ? formData.address : ''
      };
      await api.post('/units/create', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Unit created');
      setFormData({ unitNumber: '', floor: '', beds: '', pricePerNight: '', address: '', propertyGroupId: '' });
      setSelectedPropertyId('');
    } catch (err) {
      setError(err.response?.data?.message || 'Creation failed');
    }
  };

  return (
    <div className="create-property-container">
      <form className="create-property-form" onSubmit={handleSubmit}>
        <h1 className="title">Add Unit</h1>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <div className="create-property-form-group">
          <label>Property Group:</label>
          <select name="propertyGroupId" value={selectedPropertyId} onChange={handlePropertyChange} required>
            <option value="">Select Property</option>
            {propertyGroups.map(pg => (
              <option key={pg._id} value={pg._id}>{pg.name}</option>
            ))}
          </select>
        </div>

        <div className="create-property-form-group">
          <label>Unit Number:</label>
          <input name="unitNumber" value={formData.unitNumber} onChange={handleChange} type="number" required />
        </div>

        <div className="create-property-form-group">
          <label>Floor:</label>
          <input name="floor" value={formData.floor} onChange={handleChange} type="number" required />
        </div>

        <div className="create-property-form-group">
          <label>Beds:</label>
          <input name="beds" value={formData.beds} onChange={handleChange} type="number" required />
        </div>

        <div className="create-property-form-group">
          <label>Price Per Night (€):</label>
          <input name="pricePerNight" value={formData.pricePerNight} onChange={handleChange} type="number" required />
        </div>

        {propertyType === 'apartment' && (
          <div className="create-property-form-group">
            <label>Unit Address:</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Skenderija 10"
              required
            />
          </div>
        )}

        <button className="create-property-button" type="submit">Add Unit</button>
      </form>
    </div>
  );
};

export default CreateUnit;