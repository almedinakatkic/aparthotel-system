import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import OwnerReportPDF from '../components/OwnerReportPDF';
import '../assets/styles/ownerReport.css';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const OwnerReport = () => {
  const [reports, setReports] = useState([]);
  const [currentReportIndex, setCurrentReportIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString('default', { month: 'long' })
  );
  const [enteredYear, setEnteredYear] = useState(new Date().getFullYear());
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get(`/owner/${user.id}/reports`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setReports(res.data);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      }
    };

    if (token && user?.id) {
      fetchReports();
    }
  }, [token, user]);

  const filteredReports = reports.filter((report) =>
    report.apartment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visibleReports = filteredReports.length > 0 ? filteredReports : reports;
  const currentReport = visibleReports[currentReportIndex] || null;

  const navigateReport = (direction) => {
    const newIndex = currentReportIndex + direction;
    if (newIndex >= 0 && newIndex < visibleReports.length) {
      setCurrentReportIndex(newIndex);
    }
  };

  if (!currentReport) {
    return <div className="owner-report-container">No reports available.</div>;
  }

  return (
    <div className="owner-report-container">
      <div className="report-header">
        <h2>Owner Report #{currentReport.oReportID}</h2>
        <p className="report-date">{new Date(currentReport.date).toLocaleDateString()}</p>

        <input
          type="text"
          placeholder="Search by apartment    ⌕"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentReportIndex(0);
          }}
          className="search-bar"
        />
      </div>

      <div className="report-section">
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label htmlFor="month-select"><strong>Month:</strong></label><br />
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="search-bar"
              style={{ width: '150px' }}
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="year-input"><strong>Year:</strong></label><br />
            <input
              type="number"
              id="year-input"
              value={enteredYear}
              onChange={(e) => setEnteredYear(e.target.value)}
              className="search-bar"
              style={{ width: '120px' }}
              placeholder="e.g. 2025"
            />
          </div>
        </div>
      </div>

      <div className="report-section">
        <h3>Apartment: {currentReport.apartment}</h3>
        <p>Rental Income: ${currentReport.rentalIncome.toFixed(2)}</p>
      </div>

      <div className="report-section">
        <h3>Expenses Deducted</h3>
        <ul className="expenses-list">
          <li>Maintenance: ${currentReport.expenses.maintenance.toFixed(2)}</li>
          <li>Cleaning: ${currentReport.expenses.cleaning.toFixed(2)}</li>
          <li className="total">
            Total Expenses: $
            {(currentReport.expenses.maintenance + currentReport.expenses.cleaning).toFixed(2)}
          </li>
        </ul>
      </div>

      <div className="report-section">
        <h3>Owner Income</h3>
        <div className="income-display">
          <p>
            Net Owner Income: <strong>${currentReport.ownerIncome.toFixed(2)}</strong>
          </p>
        </div>
      </div>

      <div className="navigation-controls">
        <div className="report-navigation">
          <button
            onClick={() => navigateReport(-1)}
            disabled={currentReportIndex === 0}
            className="nav-btn"
          >
            &lt; Previous
          </button>
          <span className="report-counter">
            Report {currentReportIndex + 1} of {visibleReports.length}
          </span>
          <button
            onClick={() => navigateReport(1)}
            disabled={currentReportIndex === visibleReports.length - 1}
            className="nav-btn"
          >
            Next &gt;
          </button>
        </div>
      </div>

      <div className="action-buttons">
        <PDFDownloadLink
          document={<OwnerReportPDF report={currentReport} />}
          fileName={`owner_report_${currentReport.oReportID}.pdf`}
          className="btn pdf-btn"
        >
          {({ loading }) => (loading ? 'Preparing PDF...' : 'Save as PDF')}
        </PDFDownloadLink>
      </div>
    </div>
  );
};

export default OwnerReport;
