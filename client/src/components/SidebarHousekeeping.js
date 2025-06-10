import React from 'react';
import { NavLink } from 'react-router-dom';
import '../assets/styles/sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBroom } from '@fortawesome/free-solid-svg-icons';
import { faChartPie } from '@fortawesome/free-solid-svg-icons';
import { faClipboardList } from '@fortawesome/free-solid-svg-icons';
import { faWrench } from '@fortawesome/free-solid-svg-icons';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';



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
          to="/maintanance" 
          className="nav-item"
          activeClassName="active-nav-item"
        >
          <span className="nav-icon"><FontAwesomeIcon icon={faWrench} /></span>
          <span className="nav-text">Maintenance Tasks</span>
        </NavLink>


         <NavLink 
          to="/week" 
          className="nav-item"
          activeClassName="active-nav-item"
        >
          <span className="nav-icon"><FontAwesomeIcon icon={faCalendarAlt} /></span>
          <span className="nav-text">Calendar</span>
        </NavLink>

        
      </nav>
    </div>
  </div>
);

export default SidebarHousekeeping;