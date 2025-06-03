import React from 'react';
import { NavLink } from 'react-router-dom';
import '../assets/styles/sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
                  to="/dashboard" 
                  className="nav-item"
                  activeClassName="active-nav-item"
                >
                  <span className="nav-icon"><FontAwesomeIcon icon={faChartPie} /></span>
                  <span className="nav-text">Dashboard</span>
                </NavLink>

        <NavLink 
          to="/reportsowner"
          className={({ isActive }) => isActive ? 'nav-item active-nav-item' : 'nav-item'}
        >
          <span className="nav-icon"><FontAwesomeIcon icon={faChartLine} /></span>
          <span className="nav-text">My Report</span>
        </NavLink>

        <NavLink 
          to="/ownerapartmentlist"
          className={({ isActive }) => isActive ? 'nav-item active-nav-item' : 'nav-item'}
        >
          <span className="nav-icon"><FontAwesomeIcon icon={faBuilding} /></span>
          <span className="nav-text">My Apartments</span>
        </NavLink>


         <NavLink 
          to="/apartmentdetails"
          className={({ isActive }) => isActive ? 'nav-item active-nav-item' : 'nav-item'}
        >
                  <span className="nav-icon"><FontAwesomeIcon icon={faCubes} /></span>
                  <span className="nav-text">Apartment Details</span>
        </NavLink>



      </nav>
    </div>
  </div>
);

export default SidebarOwner;
