import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api/axios';
import '../assets/styles/dashboardStyle.css';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [units, setUnits] = useState([]);
  const [damageReports, setDamageReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resBookings, resUnits, resReports] = await Promise.all([
          api.get('/bookings', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/units', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/damage-reports', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setBookings(resBookings.data);
        setUnits(resUnits.data);
        setDamageReports(resReports.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) return <div>Loading dashboard...</div>;

  const todayCheckIn = bookings.filter(b => b.checkIn?.slice(0, 10) === today).length;
  const todayCheckOut = bookings.filter(b => new Date(b.checkOut).toISOString().slice(0, 10) === today).length;
  const totalGuests = bookings.reduce((sum, b) => sum + (b.numGuests || 0), 0);

  const occupiedUnitIds = new Set(bookings.map(b => b.unitId?._id || b.unitId));
  const totalUnits = units.length;
  const totalOccupiedRooms = occupiedUnitIds.size;
  const totalAvailableRooms = totalUnits - totalOccupiedRooms;

  const upcomingCheckIns = bookings.filter(b =>
    [today, tomorrow].includes(b.checkIn?.slice(0, 10))
  );

  const upcomingCheckOuts = bookings.filter(b =>
    [today, tomorrow].includes(new Date(b.checkOut).toISOString().slice(0, 10))
  );

  const bookingsPerMonth = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(0, i).toLocaleString('default', { month: 'short' }),
    count: 0
  }));
  bookings.forEach(b => {
    const monthIndex = new Date(b.checkIn).getMonth();
    bookingsPerMonth[monthIndex].count += 1;
  });

  const handleDeleteReport = async (reportId) => {
  if (!window.confirm('Are you sure you want to delete this report?')) return;

  try {
    await api.delete(`/damage-reports/${reportId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setDamageReports(prev => prev.filter(r => r._id !== reportId));
  } catch (err) {
    console.error('Error deleting report:', err);
    alert('Failed to delete the report. Try again.');
  }
};


  return (
    <div className="dashboard">
      <div className="overview">
        <h3 className='overview-heading'>Overview</h3>
        <div className="overview-stats spaced-overview">
          <div className="overview-item">Today's Check-in <span>{todayCheckIn}</span></div>
          <div className="overview-item">Today's Check-out <span>{todayCheckOut}</span></div>
          <div className="overview-item">Total Guests <span>{totalGuests}</span></div>
          <div className="overview-item">Total Available Rooms <span>{totalAvailableRooms}</span></div>
          <div className="overview-item">Total Occupied Rooms <span>{totalOccupiedRooms}</span></div>
        </div>
      </div>


      <div className="room-status-section">
        <h3 className="section-heading">Upcoming Guest Activity (Next 7 Days)</h3>
        <div className="activity-blocks-horizontal">
          {/* Check-ins */}
          <div className="status-block">
            <h4>Check-ins</h4>
            {(() => {
              const next7Days = Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                return date.toISOString().slice(0, 10);
              });

              const groupedCheckIns = next7Days.map(date => {
                const bookingsForDate = bookings.filter(b => b.checkIn?.slice(0, 10) === date);
                return {
                  date,
                  bookings: bookingsForDate
                };
              }).filter(group => group.bookings.length > 0);

              return groupedCheckIns.length > 0 ? (
                <div className="upcoming-checkins-list">
                  {groupedCheckIns.map(({ date, bookings }) => (
                    <div key={date} className="checkin-day-block">
                      <h5>{new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</h5>
                      <ul>
                        {bookings.map((b, idx) => (
                          <li key={idx}>
                            <strong>{b.guestName || 'Guest'} </strong> ({b.numGuests} guests) – Apt {b.unitId?.unitNumber || b.unitNumber}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No upcoming check-ins.</p>
              );
            })()}
          </div>

          {/* Check-outs */}
          <div className="status-block">
            <h4>Check-outs</h4>
            {(() => {
              const next7Days = Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                return date.toISOString().slice(0, 10);
              });

              const groupedCheckOuts = next7Days.map(date => {
                const bookingsForDate = bookings.filter(b =>
                  new Date(b.checkOut).toISOString().slice(0, 10) === date
                );
                return {
                  date,
                  bookings: bookingsForDate
                };
              }).filter(group => group.bookings.length > 0);

              return groupedCheckOuts.length > 0 ? (
                <div className="upcoming-checkins-list">
                  {groupedCheckOuts.map(({ date, bookings }) => (
                    <div key={date} className="checkin-day-block">
                      <h5>{new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</h5>
                      <ul>
                        {bookings.map((b, idx) => (
                          <li key={idx}>
                            <strong>{b.guestName || 'Guest'}</strong> ({b.numGuests} guests) – Apt {b.unitId?.unitNumber || b.unitNumber}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No upcoming check-outs.</p>
              );
            })()}
          </div>
        </div>
      </div>


      <div className="bottom-sections">
        <div className="occupancy">
          <div className="occupancy-header">
            <h3>Occupancy Statistics</h3>
            <button className="monthly-btn">📅 Monthly</button>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={bookingsPerMonth}>
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#fab972" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="feedback">
          <h3>Recent Damage Reports</h3>
          <div className="damage-report-scroll-container">
            {damageReports.length > 0 ? (
              damageReports.map((report, index) => (
                <div key={report._id || index} className="damage-report-item">
                  <div className="damage-report-header">
                    <strong>Apt {report.unitNumber}</strong> {new Date(report.date).toLocaleDateString()}
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteReport(report._id)}
                      title="Delete report"
                    >
                      Delete
                    </button>
                  </div>
                  <p>{report.description}</p>
                  {report.image && (
                    <img
                      src={`/uploads/${report.image}`}
                      alt="Damage"
                      className="damage-report-image"
                    />
                  )}
                </div>

              ))
            ) : (
              <p>No damage reports found.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
