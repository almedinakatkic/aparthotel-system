import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine, faHotel, faMoneyBillWave, faUsers, faCalendarAlt, faTrash
} from '@fortawesome/free-solid-svg-icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend
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
  const [notesLoading, setNotesLoading] = useState(true);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(`/owner/${user.id}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { timeRange }
        });
        setDashboardData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id && token) fetchDashboardData();
  }, [timeRange, token, user?.id]);

  // Fetch damage reports
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

    if (user?.id && token) fetchDamageReports();
  }, [token, user?.id]);

  // Fetch notes from backend
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await api.get(`/owner/${user.id}/notes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotes(response.data || []);
      } catch (err) {
        console.error('Error fetching notes:', err);
      } finally {
        setNotesLoading(false);
      }
    };

    if (user?.id && token) fetchNotes();
  }, [token, user?.id]);

  const handleAddNote = async () => {
    if (newNote.trim() === '') return;
    try {
      const response = await api.post(`/owner/${user.id}/notes`, { content: newNote }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes([response.data, ...notes]);
      setNewNote('');
    } catch (err) {
      console.error('Error adding note:', err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await api.delete(`/owner/${user.id}/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(notes.filter(note => note._id !== noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  if (isLoading) return <div className="loading-indicator">Loading dashboard data...</div>;
  if (error) return <div className="error-indicator">Error: {error}</div>;
  if (!dashboardData) return <div className="error-indicator">No data to show.</div>;

  const {
    occupancyRate, revenue, expenses,
    upcomingBookings, revenueTrend
  } = dashboardData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '4px'
        }}>
          <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>{label}</p>
          {payload.map((item, index) => (
            <p key={index} style={{ color: item.color, margin: '3px 0' }}>
              {item.name}: {item.dataKey === 'revenue' ? formatCurrency(item.value) : `${item.value}%`}
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
        </header>

        <section className="metrics-section">
          <div className="metric-card">
            <div className="metric-icon"><FontAwesomeIcon icon={faHotel} /></div>
            <div className="metric-info"><h3>Occupancy Rate</h3><p className="metric-value">{occupancyRate}%</p></div>
          </div>
          <div className="metric-card">
            <div className="metric-icon"><FontAwesomeIcon icon={faMoneyBillWave} /></div>
            <div className="metric-info"><h3>Revenue</h3><p className="metric-value">{formatCurrency(revenue)}</p></div>
          </div>
          <div className="metric-card">
            <div className="metric-icon"><FontAwesomeIcon icon={faChartLine} /></div>
            <div className="metric-info"><h3>Profit</h3><p className="metric-value">{formatCurrency(revenue - expenses)}</p></div>
          </div>
        </section>

        <section className="charts-section">
          <div className="chart-container">
            <h2>Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fill: '#666' }} tickMargin={10} />
                <YAxis tickFormatter={(value) => `$${value}`} tick={{ fill: '#666' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#8884d8" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h2>Owner Notes</h2>
            <div className="owner-notes">
              <div className="notes-list">
                {notesLoading ? (
                  <p>Loading notes...</p>
                ) : notes.length === 0 ? (
                  <p className="empty-notes">Notes will show here.</p>
                ) : (
                  <ul>
                    {notes.map(note => (
                      <li key={note._id} className="note-item">
                        <span>{note.content}</span>
                        <button
                          className="delete-note-btn"
                          onClick={() => handleDeleteNote(note._id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="note-input-container" style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Type a note"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNote();
                    }
                  }}
                  className="note-input"
                  style={{ flex: 1 }}
                />
                <button onClick={handleAddNote} className="add-note-btn">
                  Add
                </button>
              </div>


            </div>
          </div>
        </section>

        <section className="activities-section">
          <div className="upcoming-bookings">
            <h2><FontAwesomeIcon icon={faCalendarAlt} /> Upcoming Bookings</h2>
            <table className="table-container">
              <thead>
                <tr><th>Room</th><th>Guest</th><th>Check-In</th><th>Nights</th><th>Revenue</th></tr>
              </thead>
              <tbody>
                {upcomingBookings.map(b => (
                  <tr key={b.id}>
                    <td>{b.room}</td><td>{b.guest}</td><td>{b.checkIn}</td><td>{b.nights}</td><td>{formatCurrency(b.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="maintenance-issues">
            <h2><FontAwesomeIcon icon={faUsers} /> Maintenance Issues</h2>
            <h3 style={{ marginTop: '2rem' }}>Recent Damage Reports</h3>
            <ul>
              {damageReports.length > 0 ? damageReports.slice(0, 5).map(report => (
                <li key={report._id}>
                  <strong>Apt {report.unitNumber}</strong> – {new Date(report.date).toLocaleDateString()}
                  <p>{report.description}</p><hr />
                </li>
              )) : <li>No recent damage reports.</li>}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
};

export default OwnerDashboard;
