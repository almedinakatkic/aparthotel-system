import {
  faBuilding,
  faCalendarCheck,
  faChartPie,
  faCubes,
  faFileInvoiceDollar,
  faKey,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink } from 'react-router-dom';
import '../assets/styles/sidebar.css';

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
          to="/manage-users" 
          className="nav-item"
          activeClassName="active-nav-item"
        >
          <span className="nav-icon"><FontAwesomeIcon icon={faUserPlus} /></span>
          <span className="nav-text">User Management</span>
        </NavLink>
        <NavLink 
          to="/manage-properties" 
          className="nav-item"
          activeClassName="active-nav-item"
        >
          <span className="nav-icon"><FontAwesomeIcon icon={faBuilding} /></span>
          <span className="nav-text">Property Management</span>
        </NavLink>
        <NavLink 
          to="/units/manage" 
          className="nav-item"
          activeClassName="active-nav-item"
        >
          <span className="nav-icon"><FontAwesomeIcon icon={faCubes} /></span>
          <span className="nav-text">Unit Management</span>
        </NavLink>
        <NavLink 
          to="/booking-management" 
          className="nav-item"
          activeClassName="active-nav-item"
        >
          <span className="nav-icon"><FontAwesomeIcon icon={faCalendarCheck} /></span>
          <span className="nav-text">Booking Management</span>
        </NavLink>
        
        <NavLink to="/reset-user-password" className="nav-item" activeClassName="active-nav-item">
          <span className="nav-icon"><FontAwesomeIcon icon={faKey} /></span>
          <span className="nav-text">Reset Password</span>
        </NavLink>

        <NavLink 
          to="/reports" 
          className="nav-item"
          activeClassName="active-nav-item"
        >
          <span className="nav-icon"><FontAwesomeIcon icon={faFileInvoiceDollar} /></span>
          <span className="nav-text">Reports</span>
        </NavLink>
      </nav>
    </div>
  </div>
);

export default SidebarManager;