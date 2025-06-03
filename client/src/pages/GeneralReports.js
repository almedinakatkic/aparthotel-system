import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import GeneralReportPDF from '../components/GeneralReportPDF';
import api from '../api/axios';
import '../assets/styles/generalReport.css';

const GeneralReports = () => {
  const [filters, setFilters] = useState({ day: '', month: '', year: '' });
  const [report, setReport] = useState(null);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const getFormattedDate = () => {
    const { day, month, year } = filters;
    const suffix = (d) => {
      if (d > 3 && d < 21) return 'th';
      switch (d % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    if (day && month && year) {
      return `${day}${suffix(parseInt(day))} ${months[month - 1]} ${year}`;
    } else if (month && year) {
      return `${months[month - 1]} ${year}`;
    } else if (year) {
      return `${year}`;
    }
    return '';
  };

  const fetchReport = async () => {
    const { day, month, year } = filters;

    if (day && (!month || !year)) {
      alert("For daily reports, select day, month, and year.");
      return;
    }
    if (month && !year) {
      alert("For monthly reports, select both month and year.");
      return;
    }
    if (!day && !month && !year) {
      alert("Please select at least the year.");
      return;
    }

    try {
      const res = await api.get('/bookings/general', { params: filters });
      setReport({ ...res.data, label: getFormattedDate() });
    } catch (err) {
      console.error("Error fetching report:", err);
    }
  };

  useEffect(() => {
    const today = new Date();
    setFilters({
      day: '',
      month: '',
      year: today.getFullYear().toString()
    });
  }, []);

  return (
    <div className="general-report-container">
      <div className="report-header">
        <h2>Generate General Report</h2>

        <div className="date-selector">
          <select name="day" value={filters.day} onChange={handleChange}>
            <option value="">Day</option>
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select name="month" value={filters.month} onChange={handleChange}>
            <option value="">Month</option>
            {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>

          <select name="year" value={filters.year} onChange={handleChange}>
            <option value="">Year</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <button className="btn generate-btn" onClick={fetchReport}>
            Generate Report
          </button>
        </div>
      </div>

      {report && (
        <>
          <div className="report-header">
            <h2>General Report</h2>
            <strong><p className="report-date">{report.label}</p></strong>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Income</h3>
              <p style={{ fontSize: '1.6em', margin: 0 }}>
                <strong>{report.totalIncome} €</strong>
              </p>
            </div>
          </div>

          {report && report.totalIncome != null && (
  <div className="action-buttons">
    <PDFDownloadLink
      document={<GeneralReportPDF report={report} />}
      fileName={`general_report_${report.label.replace(/\s+/g, '_')}.pdf`}
      className="btn pdf-btn"
    >
      {({ loading }) => (loading ? 'Preparing PDF...' : 'Export PDF')}
    </PDFDownloadLink>
  </div>
)}

        </>
      )}
    </div>
  );
};

export default GeneralReports;
