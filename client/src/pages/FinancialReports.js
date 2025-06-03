import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import FinancialReportPDF from '../components/FinancialReportPDF';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import '../assets/styles/financialReport.css';

const FinancialReports = () => {
  const { user, token } = useAuth();
  const [propertyGroups, setPropertyGroups] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString('default', { month: 'long' })
  );
  const [enteredYear, setEnteredYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState(null);
  const [hasData, setHasData] = useState(false);
  const navigate = useNavigate();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    const fetchPropertyGroups = async () => {
      try {
        const res = await api.get(`/property-group/company/${user.companyId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPropertyGroups(res.data);
      } catch (err) {
        console.error('Failed to fetch property groups:', err);
      }
    };
    fetchPropertyGroups();
  }, [user.companyId, token]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedProperty) {
        setReport(null);
        setHasData(false);
        return;
      }
      try {
        const res = await api.get(`/bookings/property/${selectedProperty}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const bookings = res.data || [];
        const monthIndex = months.indexOf(selectedMonth);

        const filtered = bookings.filter(b => {
          const checkIn = new Date(b.checkIn);
          return checkIn.getMonth() === monthIndex && checkIn.getFullYear() === parseInt(enteredYear);
        });

        if (filtered.length === 0) {
          setHasData(false);
          setReport(null);
          return;
        }

        const rental = filtered.reduce((sum, b) => sum + b.fullPrice, 0);

        const generatedReport = {
          reportID: Math.floor(1000 + Math.random() * 9000),
          date: new Date().toLocaleDateString(),
          rental,
          expenses: {
            maintenance: 0,
            cleaning: 0
          },
          companyShare: 30,
          ownerShare: 70
        };

        setReport(generatedReport);
        setHasData(true);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      }
    };

    fetchBookings();
  }, [selectedProperty, selectedMonth, enteredYear, token]);

  const totalExpenses = (report?.expenses.maintenance || 0) + (report?.expenses.cleaning || 0);
  const netIncome = (report?.rental || 0) - totalExpenses;

  return (
    <div className="financial-report-container">
      <div className="report-header">
        <h2>Financial Report</h2>
        <p className="report-date">{report?.date || new Date().toLocaleDateString()}</p>

        <div className='filter-row'>
          <div style={{ flex: '1 1 30%' }}>
            <label htmlFor="property-select"><strong>Property:</strong></label><br />
            <select
              id="property-select"
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="search-bar"
              style={{ width: '100%' }}
            >
              <option value="">Select Property</option>
              {propertyGroups.map(pg => (
                <option key={pg._id} value={pg._id}>{pg.name}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1 1 30%' }}>
            <label htmlFor="month-select"><strong>Month:</strong></label><br />
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="search-bar"
              style={{ width: '100%' }}
            >
              {months.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1 1 30%' }}>
            <label htmlFor="year-input"><strong>Year:</strong></label><br />
            <input
              type="number"
              id="year-input"
              value={enteredYear}
              onChange={(e) => setEnteredYear(e.target.value)}
              className="search-bar"
              style={{ width: '100%' }}
              placeholder="e.g. 2025"
            />
          </div>
        </div>
      </div>

      {!selectedProperty ? (
        <p style={{ marginTop: '2rem' }}>Please select a property to view financial reports.</p>
      ) : !hasData ? (
        <p style={{ marginTop: '2rem' }}>No bookings found for the selected filters.</p>
      ) : report && (
        <>

          <div className="report-section">
            <h3>Expenses</h3>
            <ul className="expenses-list">
              <li>Maintenance: ${report.expenses.maintenance.toFixed(2)}</li>
              <li>Cleaning: ${report.expenses.cleaning.toFixed(2)}</li>
              <li className="total">Total Expenses: ${totalExpenses.toFixed(2)}</li>
            </ul>
          </div>

          <div className="report-section">
            <h3>Distribution</h3>
            <div className="distribution-grid">
              <div>
                <p>Net Income: ${netIncome.toFixed(2)}</p>
                <p>Company Share ({report.companyShare}%): ${
                  (netIncome * (report.companyShare / 100)).toFixed(2)
                }</p>
                <p>Owner Share ({report.ownerShare}%): ${
                  (netIncome * (report.ownerShare / 100)).toFixed(2)
                }</p>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <PDFDownloadLink
              document={
                <FinancialReportPDF
                  report={report}
                  totals={{ totalExpenses, netIncome }}
                />
              }
              fileName={`financial_report_${selectedProperty}_${selectedMonth}_${enteredYear}.pdf`}
              className="btn pdf-btn"
            >
              {({ loading }) => (loading ? 'Preparing PDF...' : 'Save as PDF')}
            </PDFDownloadLink>
          </div>
        </>
      )}
    </div>
  );
};

export default FinancialReports;