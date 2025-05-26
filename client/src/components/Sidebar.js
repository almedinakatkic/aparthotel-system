import React from 'react';
import { useAuth } from '../context/AuthContext';
import SidebarManager from './SidebarManager';
import SidebarFrontOffice from './SidebarFrontOffice';
import SidebarHousekeeping from './SidebarHousekeeping';
import SidebarOwner from './SidebarOwner.js';

const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'manager':
      return <SidebarManager />;
    case 'frontoffice':
      return <SidebarFrontOffice />;
    case 'housekeeping':
      return <SidebarHousekeeping />;
    case 'owner':
      return <SidebarOwner />;
    default:
      return null;
  }
};

export default Sidebar;
