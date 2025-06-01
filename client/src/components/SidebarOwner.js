import React from 'react';
import { NavLink } from 'react-router-dom';
import '../assets/styles/sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine } from '@fortawesome/free-solid-svg-icons'; // Using chart icon for reports

const SidebarOwner = () => (
  <div className="sidebar">
    <div className="sidebar-content">
      <nav className="sidebar-nav">
        <NavLink 
          to="/owner-report" 
          className="nav-item"
          activeClassName="active-nav-item"
        >
          <span className="nav-icon"><FontAwesomeIcon icon={faChartLine} /></span>
          <span className="nav-text">My Report</span>
        </NavLink>
      </nav>
    </div>
  </div>
);

export default SidebarOwner;