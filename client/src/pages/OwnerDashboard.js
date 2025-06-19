import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine, faHotel, faMoneyBillWave, faUsers, faCalendarAlt, faStar
} from '@fortawesome/free-solid-svg-icons';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, ComposedChart, Line, LineChart
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
  const [damageReports, setDamageReports] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

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

  useEffect(() => {
    const fetchDamageReports = async () => {
      try {
        const response = await api.get('/damage-reports', {
          headers: { Authorization: `Bearer ${token}` },
          params: { ownerId: user.id }
        });

        setDamageReports(response.data || []);
      } catch (err) {
        console.error('Error fetching damage reports:', err);
      }
    };

    if (user?.id && token) {
      fetchDamageReports();
    }
  }, [token, user?.id]);

  if (isLoading) return <div className="loading-indicator">Loading dashboard data...</div>;
  if (error) return <div className="error-indicator">Error: {error}</div>;
  if (!dashboardData) return <div className="error-indicator">No data to show.</div>;

  const {
    occupancyRate, revenue, expenses, guestSatisfaction,
    upcomingBookings, maintenanceIssues, revenueTrend, occupancyTrend
  } = dashboardData;

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: '#fff',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}>
          <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>{label}</p>
          {payload.map((item, index) => (
            <p key={index} style={{ 
              color: item.color,
              margin: '3px 0'
            }}>
              {item.name}: {item.dataKey === 'revenue' ? 
                formatCurrency(item.value) : 
                `${item.value}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="owner-dashboard-container">
      <main className="owner-dashboard-content">
        <header className="dashboard-header">
          <h1>Owner Dashboard</h1>
          <div className="time-range-selector">
            <select
              id="timeRange"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
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
        </section>

        <section className="charts-section">
          <div className="chart-container">
            <h2>Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={revenueTrend}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#666' }}
                  tickMargin={10}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value}`}
                  tick={{ fill: '#666' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="revenue" 
                  name="Revenue" 
                  fill="#8884d8" 
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
              <h2>Owner Notes</h2>

              <div className="owner-notes">
                <div className="notes-list">
                  {notes.length === 0 ? (
                    <p className="empty-notes">Notes will show here.</p>
                  ) : (
                    <ul>
                      {notes.map((note, index) => (
                        <li key={index}>{note}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Type a note and press Enter"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newNote.trim() !== '') {
                      setNotes([newNote, ...notes]);
                      setNewNote('');
                    }
                  }}
                  className="note-input"
                />
              </div>
            </div>

          

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
            <h3 style={{ marginTop: '2rem' }}>Recent Damage Reports</h3>
            <ul>
              {Array.isArray(damageReports) && damageReports.length > 0 ? (
                damageReports.slice(0, 5).map((report, index) => (
                  <li key={report._id || index}>
                    <strong>Apt {report.unitNumber}</strong> – {new Date(report.date).toLocaleDateString()}
                    <p>{report.description}</p>
                    <hr />
                  </li>
                ))
              ) : (
                <li>No recent damage reports.</li>
              )}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
};

export default OwnerDashboard;