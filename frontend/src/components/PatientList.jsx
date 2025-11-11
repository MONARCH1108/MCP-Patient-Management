import { useState, useEffect } from 'react';
import { api } from '../services/api';
import PatientCard from './PatientCard';

function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getAllPatients();
      if (result.success) {
        setPatients(result.data);
      } else {
        setError(result.error || 'Failed to fetch patients');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPatients();
  }, []);

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>All Patients</h2>
        <button onClick={fetchAllPatients} className="btn-primary" disabled={loading}>
          {loading ? 'Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {loading && <div className="loading">Loading patients...</div>}

      {!loading && !error && (
        <>
          <div className="results-count">
            Found {patients.length} patient{patients.length !== 1 ? 's' : ''}
          </div>
          <div className="patients-grid">
            {patients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default PatientList;

