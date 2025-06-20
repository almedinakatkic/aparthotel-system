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
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [shares, setShares] = useState({ companyShare: 30, ownerShare: 70 });

  const navigate = useNavigate();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i);

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

        const selected = propertyGroups.find(pg => pg._id === selectedProperty);
        const companyShare = selected?.companyShare ?? 30;
        const ownerShare = selected?.ownerShare ?? 70;

        setShares({ companyShare, ownerShare });

        const generatedReport = {
          reportID: Math.floor(1000 + Math.random() * 9000),
          date: new Date().toLocaleDateString(),
          rental
        };

        setReport(generatedReport);
        setHasData(true);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      }
    };

    fetchBookings();
  }, [selectedProperty, selectedMonth, enteredYear, propertyGroups]);

  const netIncome = (report?.rental || 0) - totalExpenses;

  return (
    <div className="financial-report-container">
      <div className="report-header">
        <h2 style={{ color: 'black' }}>Financial Report</h2>
        <p className="report-date">{report?.date || new Date().toLocaleDateString()}</p>

        <div className='filter-row'>
          <div style={{ flex: '1 1 30%' }}>
            <label><strong>Property:</strong></label><br />
            <select
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
            <label><strong>Month:</strong></label><br />
            <select
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
            <label><strong>Year:</strong></label><br />
            <select
              value={enteredYear}
              onChange={(e) => setEnteredYear(e.target.value)}
              className="search-bar"
              style={{ width: '100%' }}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
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
            <div className="expenses-inline">
              <label><strong>Expenses:</strong></label>
              <input
                type="number"
                value={totalExpenses}
                onChange={(e) => setTotalExpenses(Math.max(0, parseFloat(e.target.value) || 0))}
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="report-section">
            <label><strong>Distribution:</strong></label>
            <div className="distribution-grid">
              <div>
                <p>Net Income: €{netIncome.toFixed(2)}</p>
                <p>Company Share ({shares.companyShare}%): €{(netIncome * (shares.companyShare / 100)).toFixed(2)}</p>
                <p>Owner Share ({shares.ownerShare}%): €{(netIncome * (shares.ownerShare / 100)).toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <PDFDownloadLink
              document={
                <FinancialReportPDF
                  report={{
                    ...report,
                    expenses: { total: totalExpenses },
                    companyShare: shares.companyShare,
                    ownerShare: shares.ownerShare
                  }}
                  totals={{ totalExpenses, netIncome }}
                />
              }
              fileName={`financial_report_${selectedProperty}_${selectedMonth}_${enteredYear}.pdf`}
              className="btn pdf-btn"
            >
              {({ loading }) => (loading ? 'Preparing PDF...' : 'Save as PDF')}
            </PDFDownloadLink>

            <button
              style={{ 
                backgroundColor: "#193A6F",
                color: "white",
                width: "120px",
                cursor: "pointer",
                fontWeight: "bolder",
                borderRadius: "5px",
              }}
              onClick={async () => {
                try {
                  await api.post('/financial-reports', {
                    propertyGroupId: selectedProperty,
                    month: selectedMonth,
                    year: enteredYear,
                    rentalIncome: report.rental,
                    totalExpenses,
                    netIncome,
                    companyShare: shares.companyShare,
                    ownerShare: shares.ownerShare
                  }, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  alert('Report sent to owner');
                } catch (err) {
                  alert(err.response?.data?.message || 'Failed to send report');
                }
              }}
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FinancialReports;
