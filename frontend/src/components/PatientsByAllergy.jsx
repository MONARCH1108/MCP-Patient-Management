import { useState } from 'react';
import { api } from '../services/api';
import PatientCard from './PatientCard';

function PatientsByAllergy() {
  const [allergy, setAllergy] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const commonAllergies = ['Penicillin', 'Pollen', 'Dust', 'Peanuts', 'Shellfish', 'Latex'];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!allergy.trim()) {
      setError('Please enter an allergy');
      return;
    }

    setLoading(true);
    setError(null);
    setPatients([]);

    try {
      const result = await api.getPatientsByAllergy(allergy.trim());
      if (result.success) {
        setPatients(result.data);
        if (result.data.length === 0) {
          setError('No patients found with this allergy');
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
        <h2>Filter by Allergy</h2>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="form-group">
          <label htmlFor="allergy">Allergy</label>
          <div className="allergy-input">
            <input
              type="text"
              id="allergy"
              value={allergy}
              onChange={(e) => setAllergy(e.target.value)}
              placeholder="e.g., Penicillin, Pollen"
              className="form-input"
            />
            <div className="quick-select">
              {commonAllergies.map((all) => (
                <button
                  key={all}
                  type="button"
                  className="quick-btn"
                  onClick={() => setAllergy(all)}
                >
                  {all}
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
            Found {patients.length} patient{patients.length !== 1 ? 's' : ''} with allergy: {allergy}
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

export default PatientsByAllergy;

