import { useState } from 'react';
import { api } from '../services/api';
import PatientCard from './PatientCard';

function PatientById() {
  const [patientId, setPatientId] = useState('');
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!patientId.trim()) {
      setError('Please enter a patient ID');
      return;
    }

    setLoading(true);
    setError(null);
    setPatient(null);

    try {
      const result = await api.getPatientById(patientId.trim());
      if (result.success) {
        setPatient(result.data);
      } else {
        setError(result.error || 'Patient not found');
        setPatient(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch patient');
      setPatient(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Get Patient by ID</h2>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="form-group">
          <label htmlFor="patientId">Patient ID</label>
          <input
            type="text"
            id="patientId"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="e.g., P001"
            className="form-input"
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Searching...' : '🔍 Search'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {loading && <div className="loading">Loading patient...</div>}

      {patient && (
        <div className="results-section">
          <div className="results-count">Patient Found</div>
          <PatientCard patient={patient} />
        </div>
      )}
    </div>
  );
}

export default PatientById;

