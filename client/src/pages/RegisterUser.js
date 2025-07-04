import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import '../assets/styles/CreateProperty.css';

const RegisterUser = () => {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'frontoffice',
    propertyGroupId: ''
  });
  const [propertyGroups, setPropertyGroups] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPropertyGroups = async () => {
      try {
        const res = await api.get(`/property-group/company/${user.companyId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPropertyGroups(res.data);
      } catch (err) {
        console.error('Failed to load property groups', err);
        setError('Could not load property groups');
      }
    };

    fetchPropertyGroups();
  }, [user.companyId, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await api.post(
        '/users/create',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setMessage('User created successfully');
      setFormData({ name: '', email: '', role: 'frontoffice', propertyGroupId: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="create-property-container">
      <form className="create-property-form" onSubmit={handleSubmit}>
        <h1 className="title" style={{color: '#193A6F', marginBottom: '2rem'}}>Register New User</h1>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <div className="create-property-form-group">
          <label>Name:</label>
          <input
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full name"
            required
          />
        </div>

        <div className="create-property-form-group">
          <label>Email:</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={`e.g. sara@${user?.companyName?.toLowerCase()}.com`}
            required
          />
        </div>

        <div className="create-property-form-group">
          <label>Phone:</label>
          <input
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. +38761234567"
            required
          />
        </div>

        <div className="create-property-form-group">
          <label>Role:</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="frontoffice">Front Office</option>
            <option value="housekeeping">Housekeeping</option>
            <option value="owner">Owner</option>
          </select>
        </div>

        <div className="create-property-form-group">
          <label>Assign to Property:</label>
          <select
            name="propertyGroupId"
            value={formData.propertyGroupId}
            onChange={handleChange}
            required
          >
            <option value="">Select Property</option>
            {propertyGroups.map(pg => (
              <option key={pg._id} value={pg._id}>{pg.name}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="create-property-button">Register</button>
      </form>
    </div>
  );
};

export default RegisterUser;
