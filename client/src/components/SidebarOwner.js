import React from 'react';
import { NavLink } from 'react-router-dom';
import '../assets/styles/sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { 
  faChartLine, 
  faBuilding,
  faCubes,
  faChartPie
} from '@fortawesome/free-solid-svg-icons';

const SidebarOwner = () => (
  <div className="sidebar">
    <div className="sidebar-content">
      <nav className="sidebar-nav">


          <NavLink 
                  to="/owner-dashboard" 
                  className="nav-item"
                  activeClassName="active-nav-item"
                >
                  <span className="nav-icon"><FontAwesomeIcon icon={faChartPie} /></span>
                  <span className="nav-text">Dashboard</span>
                </NavLink>

         <NavLink 
          to="/ownerapartmentlist"
          className={({ isActive }) => isActive ? 'nav-item active-nav-item' : 'nav-item'}
        >
          <span className="nav-icon"><FontAwesomeIcon icon={faBuilding} /></span>
          <span className="nav-text">My Apartments</span>
        </NavLink>

         <NavLink 
          to="/ownercalendar"
          className={({ isActive }) => isActive ? 'nav-item active-nav-item' : 'nav-item'}
        >
                  <span className="nav-icon"><FontAwesomeIcon icon={faCalendar} /></span>
                  <span className="nav-text">My Calendar</span>
        </NavLink>

        <NavLink 
          to="/owner/reports"
          className={({ isActive }) => isActive ? 'nav-item active-nav-item' : 'nav-item'}
        >
          <span className="nav-icon"><FontAwesomeIcon icon={faChartLine} /></span>
          <span className="nav-text">My Report</span>
        </NavLink>

      </nav>
    </div>
  </div>
);

export default SidebarOwner;
