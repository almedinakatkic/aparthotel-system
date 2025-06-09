import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const storedToken = localStorage.getItem('token');

  const [user, setUser] = useState(storedUser || null);
  const [token, setToken] = useState(storedToken || null);

  const login = (userData, token) => {
    setUser(userData);
    setToken(token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);

    if (userData.firstLogin) {
      navigate('/change-password');
    } else {
      navigate('/dashboard'); // Change to whatever default page you use
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
    navigate('/login');
  };

  // Optional: Redirect if already logged in and firstLogin is true
  useEffect(() => {
    if (user?.firstLogin) {
      navigate('/change-password');
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
