import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../assets/styles/loginStyle.css';
import { useAuth } from '../context/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      if (user.id && !user._id) {
        user._id = user.id;
      }

      login(user, token); 

      if (user.firstLogin) {
        navigate('/change-password');
      } else {
        if (user.role === 'manager') navigate('/dashboard');
        else if (user.role === 'frontoffice') navigate('/dashboard');
        else if (user.role === 'housekeeping') navigate('/housekeeping-tasks');
        else if (user.role === 'owner') navigate('/owner-dashboard');
        else navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="title" style={{ color: '#193A6F' }}>Sign In</h1>
        <p className="subtitle">Please enter your credentials to login</p>
        
        {error && <div className="error-message-login">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        
        <div className="forgot">
          <a onClick={() => navigate('/forgot-password')} className="forgot-password" style={{ cursor: 'pointer' }}>
            Forgot your password?</a>
        </div>
        
        <button type="submit" className="login-button-auth" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'LOGIN'}
        </button>
        
      </form>
    </div>
  );
};

export default LoginForm;
