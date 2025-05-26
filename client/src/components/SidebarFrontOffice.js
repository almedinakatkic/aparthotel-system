import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/sidebar.css';

const SidebarFrontOffice = () => (
  <div className="sidebar">
    <nav className="sidebar-menu">
      <ul>
        <li><Link to="/front-desk">Front Desk</Link></li>
        <li><Link to="/guests">Guests</Link></li>
        <li><Link to="/rooms">Rooms</Link></li>
      </ul>
    </nav>
  </div>
);

export default SidebarFrontOffice;
