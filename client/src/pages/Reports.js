import { useNavigate } from 'react-router-dom';
import '../assets/styles/reports.css';

const ReportsSelection = () => {
  const navigate = useNavigate();

  const reportOptions = [
    { name: 'Financial Reports', path: '/financial-reports', icon: '💰' },
    { name: 'General Reports', path: '/general-reports', icon: '📊' },
    { name: 'Reports History', path: '/history-reports', icon: '📄' },
  ];

  return (
    <div className="reports-selection-container">
      <div className="report-cards">
        {reportOptions.map((report) => (
          <div
            key={report.name}
            className="report-card"
            onClick={() => navigate(report.path)}
          >
            <span className="report-icon">{report.icon}</span>
            <h3 className="report-name">{report.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsSelection;