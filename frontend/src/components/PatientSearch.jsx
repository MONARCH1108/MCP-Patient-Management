import { useState } from 'react';
import { api } from '../services/api';
import PatientCard from './PatientCard';

function PatientSearch() {
  const [query, setQuery] = useState('');
  const [field, setField] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setPatients([]);

    try {
      const result = await api.searchPatients(query.trim(), field || null);
      if (result.success) {
        setPatients(result.data);
        if (result.data.length === 0) {
          setError('No patients found matching your search');
        }
      } else {
        setError(result.error || 'Search failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to search patients');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Search Patients</h2>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="form-group">
          <label htmlFor="query">Search Query</label>
          <input
            type="text"
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or ID"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="field">Search Field (Optional)</label>
          <select
            id="field"
            value={field}
            onChange={(e) => setField(e.target.value)}
            className="form-input"
          >
            <option value="">All Fields</option>
            <option value="firstName">First Name</option>
            <option value="lastName">Last Name</option>
            <option value="email">Email</option>
            <option value="id">ID</option>
          </select>
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
            Found {patients.length} patient{patients.length !== 1 ? 's' : ''}
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

export default PatientSearch;

