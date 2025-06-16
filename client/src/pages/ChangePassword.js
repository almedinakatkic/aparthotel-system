import React, { useState } from 'react';
import {useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../assets/styles/loginStyle.css';

const ChangePassword = () => {
  const { token } = useAuth();
  const navigate = useNavigate(); 
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      await api.post('/auth/change-password', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Password updated successfully.');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });

      // Redirect to login after 1 sec
      setTimeout(() => {
        navigate('/login');
      }, 1000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed.');
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <div className="rooms-container" style={{ maxWidth: '500px', margin: '130px auto' }}>
          <h1 className="title" style={{ textAlign: 'center', color: '#193A6F', marginBottom: '2rem' }}>
            Change Your Password
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                className="login-input"
                required
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                className="login-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                className="login-input"
                required
              />
            </div>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
              <button type="submit" className="login-button">
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
