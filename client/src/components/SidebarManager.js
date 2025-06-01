import React from 'react';
import { Link } from 'react-router-dom';
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
        <Link to="/dashboard" className="nav-item">
          <span className="nav-icon"><FontAwesomeIcon icon={faChartPie} /></span>
          <span className="nav-text">Dashboard</span>
        </Link>
        <Link to="/register-user" className="nav-item">
          <span className="nav-icon"><FontAwesomeIcon icon={faUserPlus} /></span>
          <span className="nav-text">Register User</span>
        </Link>
        <Link to="/financial-reports" className="nav-item">
          <span className="nav-icon"><FontAwesomeIcon icon={faFileInvoiceDollar} /></span>
          <span className="nav-text">Financial Reports</span>
        </Link>
        <Link to="/general-reports" className="nav-item">
          <span className="nav-icon"><FontAwesomeIcon icon={faFileAlt} /></span>
          <span className="nav-text">General Reports</span>
        </Link>
        <Link to="/owner-report" className="nav-item">
          <span className="nav-icon"><FontAwesomeIcon icon={faUserTie} /></span>
          <span className="nav-text">Owner Reports</span>
        </Link>
        <Link to="/manage-properties" className="nav-item">
          <span className="nav-icon"><FontAwesomeIcon icon={faBuilding} /></span>
          <span className="nav-text">Manage Properties</span>
        </Link>
        <Link to="/units/manage" className="nav-item">
          <span className="nav-icon"><FontAwesomeIcon icon={faCubes} /></span>
          <span className="nav-text">Manage Units</span>
        </Link>
        <Link to="/booking-management" className="nav-item">
          <span className="nav-icon"><FontAwesomeIcon icon={faCalendarCheck} /></span>
          <span className="nav-text">Booking Management</span>
        </Link>
      </nav>
    </div>
  </div>
);

export default SidebarManager;
