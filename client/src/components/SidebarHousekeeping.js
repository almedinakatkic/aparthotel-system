import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/sidebar.css';

const SidebarHousekeeping = () => (
  <div className="sidebar">
    <nav className="sidebar-menu">
      <ul>
        <li><Link to="/rooms">Cleaning Tasks</Link></li>
      </ul>
    </nav>
  </div>
);

export default SidebarHousekeeping;
