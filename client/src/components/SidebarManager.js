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
        <li><Link to="/general-reports">General Reports</Link></li>
        <li><Link to="/owner-report">Owner Reports</Link></li>
        <li><Link to="/manage-properties">Manage Properties</Link></li>
        <li><Link to="/units/manage">Manage Units</Link></li>
        <li><Link to="/booking-management">Booking Management</Link></li>
      </ul>
    </nav>
  </div>
);

export default SidebarManager;
