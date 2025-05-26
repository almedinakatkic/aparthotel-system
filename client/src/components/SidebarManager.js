import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/sidebar.css';

const SidebarManager = () => (
  <div className="sidebar">
    <nav className="sidebar-menu">
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/register-user">Register User</Link></li>
        <li><Link to="/financial-reports">Financial Reports</Link></li>
        <li><Link to="/general-reports">Reports</Link></li>
        <li><Link to="/manage-properties">Manage Properties</Link></li>
        <li><Link to="/units/manage">Manage Units</Link></li>
        <li><Link to="/units/manage">Guest Management</Link></li>
      </ul>
    </nav>
    <div className="sidebar-footer">
      <button className="add-booking-btn">Add Booking</button>
    </div>
  </div>
);

export default SidebarManager;
