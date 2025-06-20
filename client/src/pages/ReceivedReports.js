import React, { useEffect, useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import FinancialReportPDF from '../components/FinancialReportPDF';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import '../assets/styles/financialReport.css';

const ReceivedReports = () => {
  const { user, token } = useAuth();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      if (!user.propertyGroupId) {
        console.warn('No propertyGroupId found for this owner.');
        setReports([]);
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/financial-reports/${user.propertyGroupId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data || [];
        setReports(data);
        setFilteredReports(data);
      } catch (err) {
        console.error('Failed to fetch received reports:', err);
        setReports([]);
        setFilteredReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user, token]);

  useEffect(() => {
    const filtered = reports.filter(report => {
      const matchesMonth = selectedMonth ? report.month === selectedMonth : true;
      const matchesYear = selectedYear ? report.year === parseInt(selectedYear) : true;
      return matchesMonth && matchesYear;
    });
    setFilteredReports(filtered);
  }, [selectedMonth, selectedYear, reports]);

  return (
    <div className="financial-report-container">
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>  
        <h2 style={{ color: '#193A6F' }}>Received Financial Reports</h2>
      </div>
      <div className="filter-row" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="search-bar"
        >
          <option value="">All Months</option>
          {months.map((month) => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="search-bar"
        >
          <option value="">All Years</option>
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading reports...</p>
      ) : filteredReports.length === 0 ? (
        <p style={{ marginTop: '2rem' }}>No financial reports available for the selected filters.</p>
      ) : (
        <table className="report-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Year</th>
              <th>Rental Income (€)</th>
              <th>Expenses (€)</th>
              <th>Net Income (€)</th>
              <th>Owner Share (€)</th>
              <th>Download PDF</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report._id}>
                <td>{report.month}</td>
                <td>{report.year}</td>
                <td>{report.rentalIncome.toFixed(2)}</td>
                <td>{report.totalExpenses.toFixed(2)}</td>
                <td>{report.netIncome.toFixed(2)}</td>
                <td>{(report.netIncome * (report.ownerShare / 100)).toFixed(2)}</td>
                <td>
                  <PDFDownloadLink
                    document={
                      <FinancialReportPDF
                        report={{
                          ...report,
                          expenses: { total: report.totalExpenses },
                          companyShare: report.companyShare,
                          ownerShare: report.ownerShare
                        }}
                        totals={{
                          totalExpenses: report.totalExpenses,
                          netIncome: report.netIncome
                        }}
                      />
                    }
                    fileName={`report_${report.month}_${report.year}.pdf`}
                    className="btn pdf-btn"
                  >
                    {({ loading }) => (loading ? 'Loading...' : 'Download')}
                  </PDFDownloadLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReceivedReports;
