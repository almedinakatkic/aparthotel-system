import { useState } from 'react';
import api from '../api/axios';
import '../assets/styles/changePassword.css';
import { useAuth } from '../context/AuthContext';

const ChangePassword = () => {
  const { user, token, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const mustChange = user?.mustChangePassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const payload = mustChange
        ? { newPassword }
        : { currentPassword, newPassword };

      await api.post('/auth/change-password', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('Password updated successfully. Please log in again.');
      setTimeout(() => {
        logout();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed.');
    }
  };

  return (
    <div className="change-password-container">
      <form className="change-password-form" onSubmit={handleSubmit}>
        <h2 className="change-password-title">Change Your Password</h2>

        {!mustChange && (
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <button type="submit" className="change-password-button">
          Update
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;