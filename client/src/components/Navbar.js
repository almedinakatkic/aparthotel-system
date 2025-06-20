import React, { useState, useEffect } from 'react';
import '../assets/styles/navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser, faGear } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    setShowProfileDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest('.profile-dropdown') &&
        !event.target.closest('.profile-icon')
      ) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <span className="logo-text block">APARTHOTEL</span>
        <span className="logo-text-lowercase"><br />Database Management System</span>
      </div>

      <div className="navbar-right-section">
        <div className="navbar-profile">
          <FontAwesomeIcon
            icon={faCircleUser}
            className="profile-icon"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          />
          {showProfileDropdown && (
            <div className="profile-dropdown">
              <div className="profile-info">
                <p className="profile-name">{user?.name || 'User'}</p>
                <p className="profile-email">{user?.email || 'user@example.com'}</p>
              </div>
              <button className="settings-button" onClick={handleSettingsClick}>
                <FontAwesomeIcon icon={faGear} className="settings-icon" />
                <span className="settings-text">Settings</span>
              </button>
              <button className="logout-button" onClick={handleLogout}>Log out</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
