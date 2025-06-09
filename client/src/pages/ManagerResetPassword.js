import { useState } from 'react';
import api from '../api/axios';
import '../assets/styles/createBooking.css'; // reuse styling
import { useAuth } from '../context/AuthContext';

const ManagerResetPassword = () => {
  const { token } = useAuth();
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [foundUsers, setFoundUsers] = useState([]);

  const handleSearch = async () => {
    setError('');
    setMessage('');
    try {
      const res = await api.get(`/users/search?email=${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFoundUsers(res.data.users);
    } catch (err) {
      setError('User not found or error searching.');
    }
  };

  const handleReset = async () => {
    setError('');
    setMessage('');
    if (!userId || !newPassword) {
      setError('Select user and enter new password.');
      return;
    }

    try {
      await api.post(`/auth/force-reset/${userId}`, { newPassword }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Password reset successfully. User must change it on next login.');
      setEmail('');
      setUserId('');
      setNewPassword('');
      setFoundUsers([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed.');
    }
  };

  return (
    <div className="booking-container">
      <h2 className="booking-title">Force Reset User Password</h2>

      <div className="booking-form">
        <div className="form-row">
          <label>Email:</label>
          <input
            type="text"
            placeholder="Search by email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        {foundUsers.length > 0 && (
          <div className="form-row">
            <label>Select User:</label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            >
              <option value="">-- Select --</option>
              {foundUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-row">
          <label>New Password:</label>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="form-row">
          <button onClick={handleReset}>Reset Password</button>
        </div>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default ManagerResetPassword;
