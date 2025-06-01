import React from 'react';
import { NavLink } from 'react-router-dom';
import '../assets/styles/sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartPie,
  faUserPlus,
  faFileInvoiceDollar,
  faFileAlt,
  faUserTie,
  faBuilding,
  faCubes,
  faCalendarCheck
} from '@fortawesome/free-solid-svg-icons';

const SidebarManager = () => (
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
          to="/register-user" 
          className="nav-item"
          activeClassName="active-nav-item"
        >
          <span className="nav-icon"><FontAwesomeIcon icon={faUserPlus} /></span>
          <span className="nav-text">Register User</span>
        </NavLink>
        <NavLink 
          to="/reports" 
          className="nav-item"
          activeClassName="active-nav-item"
        >
          <span className="nav-icon"><FontAwesomeIcon icon={faFileInvoiceDollar} /></span>
          <span className="nav-text">Reports</span>
        </NavLink>
        {/* <NavLink 
          to="/general-reports" 
          className="nav-item"
          activeClassName="active-nav-item"
        >
          <span className="nav-icon"><FontAwesomeIcon icon={faFileAlt} /></span>
          <span className="nav-text">General Reports</span>
        </NavLink>
        <NavLink 
          to="/owner-report" 
          className="nav-item"
          activeClassName="active-nav-item"
        >
          <span className="nav-icon"><FontAwesomeIcon icon={faUserTie} /></span>
          <span className="nav-text">Owner Reports</span>
        </NavLink> */}
        <NavLink 
          to="/manage-properties" 
          className="nav-item"
          activeClassName="active-nav-item"
        >
          <span className="nav-icon"><FontAwesomeIcon icon={faBuilding} /></span>
          <span className="nav-text">Manage Properties</span>
        </NavLink>
        <NavLink 
          to="/units/manage" 
          className="nav-item"
          activeClassName="active-nav-item"
        >
          <span className="nav-icon"><FontAwesomeIcon icon={faCubes} /></span>
          <span className="nav-text">Manage Units</span>
        </NavLink>
        <NavLink 
          to="/booking-management" 
          className="nav-item"
          activeClassName="active-nav-item"
        >
          <span className="nav-icon"><FontAwesomeIcon icon={faCalendarCheck} /></span>
          <span className="nav-text">Booking Management</span>
        </NavLink>

      </nav>
    </div>
  </div>
);

export default SidebarManager;