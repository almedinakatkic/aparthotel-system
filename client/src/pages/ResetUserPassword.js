import { useEffect, useState } from 'react';
import api from '../api/axios';
import '../assets/styles/loginStyle.css';

const ResetUserPassword = () => {
  const email = 'fatima@orion.com';
  const [resetLink, setResetLink] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResetLink = async () => {
      try {
        const res = await api.get(`/auth/latest-reset-link/${email}`);
        setResetLink(res.data.resetLink);
      } catch (err) {
        setError(err.response?.data?.message || 'Something went wrong');
      }
    };

    fetchResetLink();
  }, []);

  return (
    <div className="login-container">
      <div className="login-form">
        <h1 className="title" style={{ color: '#193A6F' }}>Password Reset Request</h1>
        <p className="subtitle">
          <strong>{email}</strong> requested a reset link.
        </p>

        {error && <div className="error-message-login">{error}</div>}

        {resetLink && (
          <div className="success-message-login" style={{ marginTop: '1rem', wordBreak: 'break-all' }}>
            {resetLink}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetUserPassword;