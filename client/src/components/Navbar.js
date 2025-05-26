import React from 'react';
import '../assets/styles/navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';


const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <span className="logo-text block">APARTHOTEL</span>
        <span className="logo-text-lowercase"><br/>Database Management System</span>
      </div>

      <div className="navbar-profile">
        <FontAwesomeIcon icon={faCircleUser} className="profile-icon" />

      </div>

      
    </nav>
  );
};

export default Navbar;