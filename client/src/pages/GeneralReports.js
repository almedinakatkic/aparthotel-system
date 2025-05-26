import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PDFDownloadLink } from '@react-pdf/renderer';
import GeneralReportPDF from '../components/GeneralReportPDF';
import '../assets/styles/generalReport.css';

const GeneralReports = () => {
  const [selectedDate, setSelectedDate] = useState({
    day: '',
    month: '',
    year: ''
  });

  const [report, setReport] = useState(null);
  const navigate = useNavigate();

  const generateReportData = ({ day, month, year }) => {
    let reportDate = '';
    if (day && month && year) {
      reportDate = `${month}/${day}/${year}`;
    } else if (month && year) {
      reportDate = `${month}/${year}`;
    } else if (year) {
      reportDate = `${year}`;
    } else {
      reportDate = 'No date selected';
    }

    const newReport = {
      gReportID: Math.floor(Math.random() * 10000) + 5000,
      reportDate,
      dailyIncome:
        day && month && year ? Math.floor(Math.random() * 10000) + 5000 : 'N/A',
      monthlyIncome:
        month && year ? Math.floor(Math.random() * 250000) + 150000 : 'N/A',
      yearlyIncome:
        year ? Math.floor(Math.random() * 3000000) + 2000000 : 'N/A'
    };

    setReport(newReport);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedDate((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerate = () => {
    const { day, month, year } = selectedDate;

    if (day && (!month || !year)) {
      alert('Please provide month and year when specifying a day.');
      return;
    }

    if (month && !year) {
      alert('Please provide year when specifying a month.');
      return;
    }

    if (!year && !month && !day) {
      alert('Please provide at least a year to generate a report.');
      return;
    }

    generateReportData({ day, month, year });
  };

  useEffect(() => {
    const today = new Date();
    const defaultDate = {
      day: today.getDate().toString(),
      month: (today.getMonth() + 1).toString(),
      year: today.getFullYear().toString()
    };
    setSelectedDate(defaultDate);
    generateReportData(defaultDate);
  }, []);

  return (
    <div className="general-report-container">
      <div className="report-header">
        <h2>Generate General Report</h2>
        <div className="date-selector">
          <input
            type="number"
            name="day"
            placeholder="Day"
            min="1"
            max="31"
            value={selectedDate.day}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="month"
            placeholder="Month"
            min="1"
            max="12"
            value={selectedDate.month}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="year"
            placeholder="Year"
            min="2000"
            max="2100"
            value={selectedDate.year}
            onChange={handleInputChange}
          />
          <button className="btn generate-btn" onClick={handleGenerate}>
            Generate Report
          </button>
        </div>
      </div>

      {report && (
        <>
          <div className="report-header">
            <h2>General Report #{report.gReportID}</h2>
            <p className="report-date"> {report.reportDate}</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Daily Income</h3>
              <p>
                {report.dailyIncome !== 'N/A'
                  ? `$${report.dailyIncome.toLocaleString()}`
                  : 'N/A'}
              </p>
            </div>

            <div className="stat-card">
              <h3>Monthly Income</h3>
              <p>
                {report.monthlyIncome !== 'N/A'
                  ? `$${report.monthlyIncome.toLocaleString()}`
                  : 'N/A'}
              </p>
            </div>

            <div className="stat-card">
              <h3>Yearly Income</h3>
              <p>
                {report.yearlyIncome !== 'N/A'
                  ? `$${report.yearlyIncome.toLocaleString()}`
                  : 'N/A'}
              </p>
            </div>
          </div>

          <div className="action-buttons">
            <PDFDownloadLink
              document={<GeneralReportPDF report={report} />}
              fileName={`general_report_${report.gReportID}.pdf`}
              className="btn pdf-btn"
            >
              {({ loading }) => (loading ? 'Preparing PDF...' : 'Save as PDF')}
            </PDFDownloadLink>

            <button
              className="btn back-btn"
              onClick={() => navigate('/financial-reports')}
            >
              Back to Financial Reports
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default GeneralReports;
