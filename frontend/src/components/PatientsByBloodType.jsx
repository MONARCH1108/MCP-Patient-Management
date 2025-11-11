import { useState } from 'react';
import { api } from '../services/api';
import PatientCard from './PatientCard';

function PatientsByBloodType() {
  const [bloodType, setBloodType] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const commonBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!bloodType.trim()) {
      setError('Please enter a blood type');
      return;
    }

    setLoading(true);
    setError(null);
    setPatients([]);

    try {
      const result = await api.getPatientsByBloodType(bloodType.trim());
      if (result.success) {
        setPatients(result.data);
        if (result.data.length === 0) {
          setError('No patients found with this blood type');
        }
      } else {
        setError(result.error || 'Search failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Filter by Blood Type</h2>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="form-group">
          <label htmlFor="bloodType">Blood Type</label>
          <div className="blood-type-input">
            <input
              type="text"
              id="bloodType"
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
              placeholder="e.g., A+, O-, AB+"
              className="form-input"
            />
            <div className="quick-select">
              {commonBloodTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  className="quick-btn"
                  onClick={() => setBloodType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Searching...' : '🔍 Search'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          {patients.length === 0 ? '❌' : '⚠️'} {error}
        </div>
      )}

      {loading && <div className="loading">Searching patients...</div>}

      {patients.length > 0 && (
        <div className="results-section">
          <div className="results-count">
            Found {patients.length} patient{patients.length !== 1 ? 's' : ''} with blood type {bloodType}
          </div>
          <div className="patients-grid">
            {patients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientsByBloodType;

