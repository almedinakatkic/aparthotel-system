import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import FinancialReportPDF from '../components/FinancialReportPDF';
import '../assets/styles/financialReport.css';

const FinancialReports = () => {
  const [reports, setReports] = useState([
    {
      reportID: 1001,
      apartment: 'A101',
      date: new Date().toLocaleDateString(),
      rental: 2500.0,
      expenses: {
        maintenance: 350.0,
        cleaning: 150.0
      },
      companyShare: 30,
      ownerShare: 70
    }
  ]);
  const [currentReportIndex, setCurrentReportIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString('default', { month: 'long' })
  );
  const [enteredYear, setEnteredYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const filteredReports = reports.filter((report) =>
    report.apartment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visibleReports = filteredReports.length > 0 ? filteredReports : reports;
  const currentReport = visibleReports[currentReportIndex] || reports[0];

  const totalExpenses =
    currentReport.expenses.maintenance + currentReport.expenses.cleaning;
  const netIncome = currentReport.rental - totalExpenses;

  const generateNewReport = () => {
    const apartments = ['A101', 'B202', 'C303', 'D404'];
    const newReport = {
      reportID: reports[reports.length - 1].reportID + 1,
      apartment: apartments[Math.floor(Math.random() * apartments.length)],
      date: new Date().toLocaleDateString(),
      rental: Math.floor(Math.random() * 3000) + 1500,
      expenses: {
        maintenance: Math.floor(Math.random() * 400) + 100,
        cleaning: Math.floor(Math.random() * 200) + 50
      },
      companyShare: 30,
      ownerShare: 70
    };
    setReports([...reports, newReport]);
    setSearchQuery('');
    setCurrentReportIndex(visibleReports.length);
  };

  const navigateReport = (direction) => {
    const newIndex = currentReportIndex + direction;
    if (newIndex >= 0 && newIndex < visibleReports.length) {
      setCurrentReportIndex(newIndex);
    }
  };

  return (
    <div className="financial-report-container">
      <div className="report-header">
        <h2>Financial Report #{currentReport.reportID}</h2>
        <p className="report-date">{currentReport.date}</p>

        {/* Filters row: Month, Year, Search */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
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

          <div>
            <label htmlFor="search-apartment"><strong>Search Apartment:</strong></label><br />
            <input
              type="text"
              id="search-apartment"
              placeholder="e.g. A101"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentReportIndex(0);
              }}
              className="search-bar"
              style={{ width: '450px' }}
            />
          </div>
        </div>
      </div>

      <div className="report-section">
        <h3>Apartment: {currentReport.apartment}</h3>
        <p>Rental Income: ${currentReport.rental.toFixed(2)}</p>
      </div>

      <div className="report-section">
        <h3>Expenses</h3>
        <ul className="expenses-list">
          <li>Maintenance: ${currentReport.expenses.maintenance.toFixed(2)}</li>
          <li>Cleaning: ${currentReport.expenses.cleaning.toFixed(2)}</li>
          <li className="total">Total Expenses: ${totalExpenses.toFixed(2)}</li>
        </ul>
      </div>

      <div className="report-section">
        <h3>Distribution</h3>
        <div className="distribution-grid">
          <div>
            <p>Net Income: ${netIncome.toFixed(2)}</p>
            <p>
              Company Share ({currentReport.companyShare}%): $
              {(netIncome * (currentReport.companyShare / 100)).toFixed(2)}
            </p>
            <p>
              Owner Share ({currentReport.ownerShare}%): $
              {(netIncome * (currentReport.ownerShare / 100)).toFixed(2)}
            </p>
          </div>
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
        <button className="btn generate-btn" onClick={generateNewReport}>
          Generate New Report
        </button>
        <button
          className="btn view-general-btn"
          onClick={() => navigate('/general-reports')}
        >
          View General Reports
        </button>
        <PDFDownloadLink
          document={
            <FinancialReportPDF
              report={currentReport}
              totals={{ totalExpenses, netIncome }}
            />
          }
          fileName={`financial_report_${currentReport.reportID}.pdf`}
          className="btn pdf-btn"
        >
          {({ loading }) => (loading ? 'Preparing PDF...' : 'Save as PDF')}
        </PDFDownloadLink>
      </div>
    </div>
  );
};

export default FinancialReports;
