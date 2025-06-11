import { useState } from 'react';
import api from '../api/axios';
import '../assets/styles/loginStyle.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message || 'If this email is registered, a password reset link has been generated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="title" style={{ color: '#193A6F' }}>Forgot Password</h1>
        <p className="subtitle">Enter your email to reset your password</p>

        {error && <div className="error-message-login">{error}</div>}
        {message && <div className="success-message-login">{message}</div>}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <button type="submit" className="login-button-auth" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>

        <div className="forgot" style={{ marginTop: '1rem' }}>
          <a href="/login" className="forgot-password">Back to Login</a>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
