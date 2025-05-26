import React from 'react';
import '../assets/styles/dashboardStyle.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      {/* Overview Section */}
      <div className="overview">
        <h3 className='overview-heading'>Overview</h3>
        <div className="overview-stats">
          <div>Today's Check-in <span>25</span></div>
          <div>Today's Check-out <span>25</span></div>
          <div>Total Guests <span>25</span></div>
          <div>Total Available Rooms <span>25</span></div>
          <div>Total Occupied Rooms <span>100</span></div>
        </div>
      </div>

      {/* Room Status Section */}
      <div className="room-status">
        <h3>Room Status</h3>
        <div className="status-blocks-container">
          <div className="status-block">
            <p id='available-occupied-rooms'>Occupied Rooms: 100</p>
            <p>Clean: 50</p>
            <p>Dirty: 50</p>
          </div>
          <div className="status-block">
            <p id='available-occupied-rooms'>Available Rooms: 25</p>
            <p>Clean: 16</p>
            <p>Dirty: 9</p>
          </div>
        </div>
        <div className="divider" />
      </div>

      {/* Bottom Sections */}
      <div className="bottom-sections">
        <div className="occupancy">
          <div className="occupancy-header">
            <h3>Occupancy Statistics</h3>
            <button className="monthly-btn">📅 Monthly</button>
          </div>
          <div className="chart-placeholder">[Chart here]</div>
        </div>
        <div className="feedback">
          <h3>Customers Feedback</h3>
          <ul>
            <li>Jane ⭐⭐⭐⭐</li>
            <hr></hr>
            <li>Mark ⭐⭐</li>
            <hr></hr>
            <li>Lily ⭐⭐⭐ </li>
            <p>Room cleaning could be better.</p>
            <hr></hr>
            <li>Jack ⭐⭐⭐⭐⭐</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
