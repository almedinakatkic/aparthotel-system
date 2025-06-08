import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faHotel, faMoneyBillWave, faUsers, faCalendarAlt, faStar } from '@fortawesome/free-solid-svg-icons';
import '../assets/styles/ownerDashboard.css'; 

const OwnerDashboard = () => {
  // Sample data - replace with actual API calls
  const [dashboardData, setDashboardData] = useState({
    occupancyRate: 0,
    revenue: 0,
    expenses: 0,
    guestSatisfaction: 0,
    upcomingBookings: [],
    maintenanceIssues: []
  });

  const [timeRange, setTimeRange] = useState('month');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // In a real app, you would fetch from your API here
      setTimeout(() => {
        setDashboardData({
          occupancyRate: 78.5,
          revenue: 45280,
          expenses: 28750,
          guestSatisfaction: 4.7,
          upcomingBookings: [
            { id: 1, room: '101', guest: 'John Smith', checkIn: '2023-06-15', nights: 3, revenue: 450 },
            { id: 2, room: '205', guest: 'Maria Garcia', checkIn: '2023-06-16', nights: 5, revenue: 750 },
            { id: 3, room: '302', guest: 'Ahmed Khan', checkIn: '2023-06-18', nights: 2, revenue: 300 }
          ],
          maintenanceIssues: [
            { id: 1, room: '102', issue: 'AC not working', priority: 'High', reported: '2023-06-10' },
            { id: 2, room: '201', issue: 'Leaky faucet', priority: 'Medium', reported: '2023-06-12' }
          ]
        });
        setIsLoading(false);
      }, 1000);
    };

    fetchData();
  }, [timeRange]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="owner-dashboard-container">
      
      <main className="owner-dashboard-content">
        <header className="dashboard-header">
          <h1>Owner Dashboard</h1>
          <div className="time-range-selector">
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </header>

        {isLoading ? (
          <div className="loading-indicator">Loading dashboard data...</div>
        ) : (
          <>
            {/* Key Metrics Section */}
            <section className="metrics-section">
              <div className="metric-card">
                <div className="metric-icon">
                  <FontAwesomeIcon icon={faHotel} />
                </div>
                <div className="metric-info">
                  <h3>Occupancy Rate</h3>
                  <p className="metric-value">{dashboardData.occupancyRate}%</p>
                  <p className="metric-trend">↑ 5.2% from last {timeRange}</p>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">
                  <FontAwesomeIcon icon={faMoneyBillWave} />
                </div>
                <div className="metric-info">
                  <h3>Revenue</h3>
                  <p className="metric-value">{formatCurrency(dashboardData.revenue)}</p>
                  <p className="metric-trend">↑ 12.8% from last {timeRange}</p>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">
                  <FontAwesomeIcon icon={faChartLine} />
                </div>
                <div className="metric-info">
                  <h3>Profit</h3>
                  <p className="metric-value">{formatCurrency(dashboardData.revenue - dashboardData.expenses)}</p>
                  <p className="metric-trend">↑ 8.3% from last {timeRange}</p>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon">
                  <FontAwesomeIcon icon={faStar} />
                </div>
                <div className="metric-info">
                  <h3>Guest Satisfaction</h3>
                  <p className="metric-value">{dashboardData.guestSatisfaction}/5</p>
                  <p className="metric-trend">↑ 0.3 from last {timeRange}</p>
                </div>
              </div>
            </section>

            {/* Charts Section */}
            <section className="charts-section">
              <div className="chart-container">
                <h2>Revenue Trend</h2>
                <div className="chart-placeholder">
                  [Revenue Chart - Last 12 Months]
                  {/* In a real app, you would use a charting library like Chart.js */}
                </div>
              </div>

              <div className="chart-container">
                <h2>Occupancy Trend</h2>
                <div className="chart-placeholder">
                  [Occupancy Chart - Last 12 Months]
                </div>
              </div>
            </section>

            {/* Recent Activities Section */}
            <section className="activities-section">
              <div className="upcoming-bookings">
                <h2>
                  <FontAwesomeIcon icon={faCalendarAlt} /> Upcoming Bookings
                </h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Room</th>
                        <th>Guest</th>
                        <th>Check-In</th>
                        <th>Nights</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.upcomingBookings.map(booking => (
                        <tr key={booking.id}>
                          <td>{booking.room}</td>
                          <td>{booking.guest}</td>
                          <td>{booking.checkIn}</td>
                          <td>{booking.nights}</td>
                          <td>{formatCurrency(booking.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="maintenance-issues">
                <h2>
                  <FontAwesomeIcon icon={faUsers} /> Maintenance Issues
                </h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Room</th>
                        <th>Issue</th>
                        <th>Priority</th>
                        <th>Reported</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.maintenanceIssues.map(issue => (
                        <tr key={issue.id}>
                          <td>{issue.room}</td>
                          <td>{issue.issue}</td>
                          <td className={`priority-${issue.priority.toLowerCase()}`}>
                            {issue.priority}
                          </td>
                          <td>{issue.reported}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default OwnerDashboard;