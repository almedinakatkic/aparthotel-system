import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/settings.css';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="settings-container">
      <div className="settings-card">
        <h1 className="settings-title">Account Settings</h1>
        
        <div className="user-info">
          <div className="info-row">
            <span className="info-label">Name:</span>
            <span className="info-value">{user.name}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email:</span>
            <span className="info-value">{user.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Role:</span>
            <span className="info-value capitalize">{user.role}</span>
          </div>
        </div>

        <div className="actions">
          <button
            className="settings-button primary"
            onClick={() => navigate('/change-password')}
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;