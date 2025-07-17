import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import NewOrderPage from './pages/NewOrderPage';
import SettingsPage from './pages/SettingsPage';
import EmployeePage from './pages/EmployeePage';
import ReportsPage from './pages/ReportsPage';
import LocalizaConfigPage from './pages/LocalizaConfigPage';
import './styles/global.css'; // Crie este arquivo se desejar um CSS global
import { FaHome, FaPlusCircle, FaCog, FaUser, FaChartBar } from 'react-icons/fa';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>Lina - Gestão de Lava-Jato</h1>
          <nav>
            <Link to="/">
              <FaHome size={32} style={{ verticalAlign: 'middle', marginRight: 10 }} />
            </Link>
            <Link to="/new-order">
              <FaPlusCircle size={32} style={{ verticalAlign: 'middle', marginRight: 10 }} />
            </Link>
            <Link to="/employees">
              <FaUser size={32} style={{ verticalAlign: 'middle', marginRight: 10 }} />
            </Link>
            <Link to="/reports">
              <FaChartBar size={32} style={{ verticalAlign: 'middle', marginRight: 10 }} />
            </Link>
            <Link to="/settings">
              <FaCog size={32} style={{ verticalAlign: 'middle', marginRight: 10 }} />
            </Link>
          </nav>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/new-order" element={<NewOrderPage />} />
            <Route path="/employees" element={<EmployeePage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/localiza-config" element={<LocalizaConfigPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 