import React from 'react';
import { NavLink } from 'react-router-dom';
import '../assets/styles/sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBroom } from '@fortawesome/free-solid-svg-icons';
import { faChartPie } from '@fortawesome/free-solid-svg-icons';
import { faClipboardList } from '@fortawesome/free-solid-svg-icons';

const SidebarHousekeeping = () => (
  <div className="sidebar">
    <div className="sidebar-content">
      <nav className="sidebar-nav">
        
        
        <NavLink 
                  to="/housekeeping-dashboard" 
                  className="nav-item"
                  activeClassName="active-nav-item"
                >
                  <span className="nav-icon"><FontAwesomeIcon icon={faChartPie} /></span>
                  <span className="nav-text">Dashboard</span>
                </NavLink>

        <NavLink 
          to="/cleaning" 
          className="nav-item"
          activeClassName="active-nav-item"
        >
          <span className="nav-icon"><FontAwesomeIcon icon={faBroom} /></span>
          <span className="nav-text">Cleaning Tasks</span>
        </NavLink>

        <NavLink 
          to="/rooms" 
          className="nav-item"
          activeClassName="active-nav-item"
        >
          <span className="nav-icon"><FontAwesomeIcon icon={faClipboardList} /></span>
          <span className="nav-text">Room Management</span>
        </NavLink>
        
      </nav>
    </div>
  </div>
);

export default SidebarHousekeeping;