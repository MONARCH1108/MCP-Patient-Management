const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to handle API responses
async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  
  // Check if response is JSON
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    return data;
  } else {
    // If not JSON, it's probably an HTML error page
    const text = await response.text();
    throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}. Make sure the backend server is running on port 3001.`);
  }
}

export const api = {
  getAllPatients: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients`);
      return await handleResponse(response);
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Cannot connect to backend server. Please make sure the backend is running on http://localhost:3001');
      }
      throw error;
    }
  },

  getPatientById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${id}`);
      return await handleResponse(response);
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Cannot connect to backend server. Please make sure the backend is running on http://localhost:3001');
      }
      throw error;
    }
  },

  searchPatients: async (query, field = null) => {
    try {
      const url = field 
        ? `${API_BASE_URL}/patients/search/${encodeURIComponent(query)}?field=${field}`
        : `${API_BASE_URL}/patients/search/${encodeURIComponent(query)}`;
      const response = await fetch(url);
      return await handleResponse(response);
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Cannot connect to backend server. Please make sure the backend is running on http://localhost:3001');
      }
      throw error;
    }
  },

  getPatientsByBloodType: async (bloodType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/blood-type/${encodeURIComponent(bloodType)}`);
      return await handleResponse(response);
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Cannot connect to backend server. Please make sure the backend is running on http://localhost:3001');
      }
      throw error;
    }
  },

  getPatientsByAllergy: async (allergy) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/allergy/${encodeURIComponent(allergy)}`);
      return await handleResponse(response);
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Cannot connect to backend server. Please make sure the backend is running on http://localhost:3001');
      }
      throw error;
    }
  },

  sendChatMessage: async (message, conversationHistory = []) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, conversationHistory }),
      });
      return await handleResponse(response);
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Cannot connect to backend server. Please make sure the backend is running on http://localhost:3001');
      }
      throw error;
    }
  },
};

