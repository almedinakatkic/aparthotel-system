import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../assets/styles/financialReport.css';

const AllReports = () => {
  const { token, user } = useAuth();
  const [reports, setReports] = useState([]);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [propertyGroups, setPropertyGroups] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await api.get(`/property-group/company/${user.companyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPropertyGroups(res.data);
      } catch (err) {
        console.error('Failed to fetch property groups:', err);
      }
    };
    fetchProperties();
  }, [token, user.companyId]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/financial-reports/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReports(res.data);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      }
    };
    fetchReports();
  }, [token]);

  const filteredReports = reports.filter(r => {
    const matchesMonth = filterMonth ? r.month === filterMonth : true;
    const matchesYear = filterYear ? r.year === parseInt(filterYear) : true;
    const matchesProperty = selectedProperty ? r.propertyGroupId?._id === selectedProperty : true;
    return matchesMonth && matchesYear && matchesProperty;
  });

  return (
    <div className="financial-report-container">
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <h2 style={{ color: '#193A6F', marginBottom: '2rem' }}>All Financial Reports</h2>
      </div>
      <div className="filter-row" style={{ gap: '1rem', marginBottom: '2rem' }}>
        <select value={selectedProperty} onChange={e => setSelectedProperty(e.target.value)}>
          <option value=''>All Properties</option>
          {propertyGroups.map(pg => (
            <option key={pg._id} value={pg._id}>{pg.name}</option>
          ))}
        </select>

        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
          <option value=''>All Months</option>
          {months.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>

        <select value={filterYear} onChange={e => setFilterYear(e.target.value)}>
          <option value=''>All Years</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <table className="report-table">
        <thead>
          <tr>
            <th>Property</th>
            <th>Month</th>
            <th>Year</th>
            <th>Rental Income (€)</th>
            <th>Expenses (€)</th>
            <th>Net Income (€)</th>
            <th>Company Share (%)</th>
            <th>Owner Share (%)</th>
          </tr>
        </thead>
        <tbody>
          {filteredReports.length === 0 ? (
            <tr><td colSpan="8">No reports found for selected filters.</td></tr>
          ) : (
            filteredReports.map(r => (
              <tr key={r._id}>
                <td>{r.propertyGroupId?.name || 'Unknown'}</td>
                <td>{r.month}</td>
                <td>{r.year}</td>
                <td>{r.rentalIncome.toFixed(2)}</td>
                <td>{r.totalExpenses.toFixed(2)}</td>
                <td>{r.netIncome.toFixed(2)}</td>
                <td>{r.companyShare}%</td>
                <td>{r.ownerShare}%</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AllReports;
