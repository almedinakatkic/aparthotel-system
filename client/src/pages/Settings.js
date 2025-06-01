import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/loginStyle.css';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="form-container">
      <h1 className="title">User Settings</h1>

      <div className="settings-box">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>

        <button
          className="login-button"
          onClick={() => navigate('/change-password')}
          style={{ marginTop: '1rem' }}
        >
          Change Password
        </button>
      </div>
    </div>
  );
};

export default Settings;
