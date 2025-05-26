import React from 'react';
import FrontDeskCalendar from '../components/FrontDeskCalendar';
import '../assets/styles/frontDeskCalendar.css';

const FrontDesk = () => {
  return (
    <div className="front-desk-page">
      <h1>Front Desk Management</h1>
      <FrontDeskCalendar />
    </div>
  );
};

export default FrontDesk;