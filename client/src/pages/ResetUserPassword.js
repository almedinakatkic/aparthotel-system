import { useEffect, useState } from 'react';
import api from '../api/axios';
import '../assets/styles/loginStyle.css';

const ResetUserPassword = () => {
  const [resetRequests, setResetRequests] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get('/auth/all-reset-requests');
        const requests = res.data;

        const populated = await Promise.all(
          requests.map(async (email) => {
            try {
              const linkRes = await api.get(`/auth/latest-reset-link/${email}`);
              return { email, resetLink: linkRes.data.resetLink };
            } catch {
              return { email, resetLink: null };
            }
          })
        );

        setResetRequests(populated);
      } catch (err) {
        setError(err.response?.data?.message || 'Something went wrong');
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleRemove = async (email) => {
    try {
      await api.post('/auth/remove-reset-request', { email });
      setResetRequests((prev) => prev.filter((r) => r.email !== email));
    } catch (err) {
      console.error('Remove failed:', err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1 className="title" style={{ color: '#193A6F' }}>Password Reset Requests</h1>

        {error && <div className="error-message-login">{error}</div>}

        {resetRequests.map(({ email, resetLink }) => (
          <div key={email} style={{ marginTop: '1.5rem' }}>
            <p className="subtitle"><strong>{email}</strong> requested a reset link.</p>
            {resetLink ? (
              <a
                href={resetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="success-message-login"
                style={{ display: 'block', marginTop: '0.5rem', wordBreak: 'break-all', color: '#193A6F', textAlign: 'center' }}
              >
                {resetLink}
              </a>
            ) : (
              <div className="error-message-login">No link generated yet.</div>
            )}
            <button onClick={() => handleRemove(email)} className="login-button" style={{ marginTop: '30px', width: '250px' }}>
              Remove Request
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResetUserPassword;
