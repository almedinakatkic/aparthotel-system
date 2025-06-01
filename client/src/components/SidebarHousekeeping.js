import React from 'react';
import { NavLink } from 'react-router-dom';
import '../assets/styles/sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBroom } from '@fortawesome/free-solid-svg-icons';

const SidebarHousekeeping = () => (
  <div className="sidebar">
    <div className="sidebar-content">
      <nav className="sidebar-nav">
        <NavLink 
          to="/cleaning-tasks" 
          className="nav-item"
          activeClassName="active-nav-item"
        >
          <span className="nav-icon"><FontAwesomeIcon icon={faBroom} /></span>
          <span className="nav-text">Cleaning Tasks</span>
        </NavLink>
        
      </nav>
    </div>
  </div>
);

export default SidebarHousekeeping;