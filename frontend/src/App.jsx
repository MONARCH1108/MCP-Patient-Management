import { useState } from 'react';
import './App.css';
import PatientList from './components/PatientList';
import PatientById from './components/PatientById';
import PatientSearch from './components/PatientSearch';
import PatientsByBloodType from './components/PatientsByBloodType';
import PatientsByAllergy from './components/PatientsByAllergy';
import Chatbot from './components/Chatbot';

function App() {
  const [activeTab, setActiveTab] = useState('chat');

  const tabs = [
    { id: 'chat', label: 'AI Chat', icon: '💬' },
    { id: 'all', label: 'All Patients', icon: '👥' },
    { id: 'byId', label: 'By ID', icon: '🆔' },
    { id: 'search', label: 'Search', icon: '🔍' },
    { id: 'bloodType', label: 'Blood Type', icon: '🩸' },
    { id: 'allergy', label: 'Allergy', icon: '⚠️' },
  ];

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏥 Patient Data Management System</h1>
        <p>Manage and query patient records</p>
      </header>

      <nav className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="main-content">
        {activeTab === 'chat' && <Chatbot />}
        {activeTab === 'all' && <PatientList />}
        {activeTab === 'byId' && <PatientById />}
        {activeTab === 'search' && <PatientSearch />}
        {activeTab === 'bloodType' && <PatientsByBloodType />}
        {activeTab === 'allergy' && <PatientsByAllergy />}
      </main>
    </div>
  );
}

export default App;
