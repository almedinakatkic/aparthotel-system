import React from 'react';
import { NavLink } from 'react-router-dom';
import '../assets/styles/sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBellConcierge,
  faUsers,
  faBed
} from '@fortawesome/free-solid-svg-icons';

const SidebarFrontOffice = () => (
  <div className="sidebar">
    <div className="sidebar-content">
      <nav className="sidebar-nav">
        <NavLink 
          to="/front-desk" 
          className="nav-item"
          activeClassName="active-nav-item"
        >
          <span className="nav-icon"><FontAwesomeIcon icon={faBellConcierge} /></span>
          <span className="nav-text">Front Desk</span>
        </NavLink>

        <NavLink 
          to="/guests" 
          className="nav-item"
          activeClassName="active-nav-item"
        >
          <span className="nav-icon"><FontAwesomeIcon icon={faUsers} /></span>
          <span className="nav-text">Guests</span>
        </NavLink>

        <NavLink 
          to="/rooms" 
          className="nav-item"
          activeClassName="active-nav-item"
        >
          <span className="nav-icon"><FontAwesomeIcon icon={faBed} /></span>
          <span className="nav-text">Rooms</span>
        </NavLink>
      </nav>
    </div>
  </div>
);

export default SidebarFrontOffice;
