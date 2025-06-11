import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine, faHotel, faMoneyBillWave, faUsers, faCalendarAlt, faStar
} from '@fortawesome/free-solid-svg-icons';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../assets/styles/ownerDashboard.css';

const OwnerDashboard = () => {
  const { user, token } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get(`/owner/${user.id}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { timeRange }
        });

        if (response.data) {
          setDashboardData(response.data);
        } else {
          setError('No dashboard data returned');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id && token) {
      fetchDashboardData();
    }
  }, [timeRange, token, user?.id]);

  if (isLoading) return <div className="loading-indicator">Loading dashboard data...</div>;
  if (error) return <div className="error-indicator">Error: {error}</div>;
  if (!dashboardData) return <div className="error-indicator">No data to show.</div>;

  const {
    occupancyRate, revenue, expenses, guestSatisfaction,
    upcomingBookings, maintenanceIssues, revenueTrend, occupancyTrend
  } = dashboardData;

  return (
    <div className="owner-dashboard-container">
      <main className="owner-dashboard-content">
        <header className="dashboard-header">
          <h1>Owner Dashboard</h1>
          <div className="time-range-selector">
            <select
              id="timeRange"
              value={timeRange}
              onChange={(e) => {
                setTimeRange(e.target.value);
              }}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </header>

        <section className="metrics-section">
          <div className="metric-card">
            <div className="metric-icon"><FontAwesomeIcon icon={faHotel} /></div>
            <div className="metric-info">
              <h3>Occupancy Rate</h3>
              <p className="metric-value">{occupancyRate}%</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon"><FontAwesomeIcon icon={faMoneyBillWave} /></div>
            <div className="metric-info">
              <h3>Revenue</h3>
              <p className="metric-value">{formatCurrency(revenue)}</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon"><FontAwesomeIcon icon={faChartLine} /></div>
            <div className="metric-info">
              <h3>Profit</h3>
              <p className="metric-value">{formatCurrency(revenue - expenses)}</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon"><FontAwesomeIcon icon={faStar} /></div>
            <div className="metric-info">
              <h3>Guest Satisfaction</h3>
              <p className="metric-value">{guestSatisfaction}/5</p>
            </div>
          </div>
        </section>

        <section className="charts-section">
          {Array.isArray(revenueTrend) && revenueTrend.length > 0 && (
            <div className="chart-container">
              <h2>Revenue Trend</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {Array.isArray(occupancyTrend) && occupancyTrend.length > 0 && (
            <div className="chart-container">
              <h2>Occupancy Trend</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={occupancyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis unit="%" />
                  <Tooltip />
                  <Line type="monotone" dataKey="occupancy" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="activities-section">
          <div className="upcoming-bookings">
            <h2><FontAwesomeIcon icon={faCalendarAlt} /> Upcoming Bookings</h2>
            <table className="table-container">
              <thead>
                <tr>
                  <th>Room</th><th>Guest</th><th>Check-In</th><th>Nights</th><th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {upcomingBookings.map(b => (
                  <tr key={b.id}>
                    <td>{b.room}</td>
                    <td>{b.guest}</td>
                    <td>{b.checkIn}</td>
                    <td>{b.nights}</td>
                    <td>{formatCurrency(b.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="maintenance-issues">
            <h2><FontAwesomeIcon icon={faUsers} /> Maintenance Issues</h2>
            <table className="table-container">
              <thead>
                <tr>
                  <th>Room</th><th>Issue</th><th>Priority</th><th>Reported</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceIssues.map(issue => (
                  <tr key={issue.id}>
                    <td>{issue.room}</td>
                    <td>{issue.issue}</td>
                    <td className={`priority-${issue.priority.toLowerCase()}`}>{issue.priority}</td>
                    <td>{issue.reported}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default OwnerDashboard;
