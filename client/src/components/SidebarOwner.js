import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/sidebar.css';

const SidebarOwner = () => (
  <div className="sidebar">
    <nav className="sidebar-menu">
      <ul>
        <li><Link to="/owner-report">My Report</Link></li>
      </ul>
    </nav>
  </div>
);

export default SidebarOwner;
