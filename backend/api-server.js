import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Load patient data
let patientData = null;

function loadPatientData() {
  try {
    const dataPath = path.join(__dirname, 'data.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    patientData = JSON.parse(rawData);
    return patientData;
  } catch (error) {
    console.error('Error loading patient data:', error);
    throw error;
  }
}

// Initialize patient data
loadPatientData();

// Tool implementations
function get_all_patients() {
  return patientData.patients;
}

function get_patient_by_id(patientId) {
  const patient = patientData.patients.find((p) => p.id === patientId);
  if (!patient) {
    throw new Error(`Patient with ID ${patientId} not found.`);
  }
  return patient;
}

function search_patients(query, field = null) {
  const searchQuery = query.toLowerCase();
  return patientData.patients.filter((patient) => {
    if (field) {
      const value = String(patient[field] || '').toLowerCase();
      return value.includes(searchQuery);
    } else {
      return (
        patient.id.toLowerCase().includes(searchQuery) ||
        patient.firstName.toLowerCase().includes(searchQuery) ||
        patient.lastName.toLowerCase().includes(searchQuery) ||
        patient.email.toLowerCase().includes(searchQuery)
      );
    }
  });
}

function get_patients_by_blood_type(bloodType) {
  return patientData.patients.filter(
    (patient) => patient.bloodType === bloodType
  );
}

function get_patients_by_allergy(allergy) {
  const searchAllergy = allergy.toLowerCase();
  return patientData.patients.filter((patient) =>
    patient.allergies.some((a) => a.toLowerCase().includes(searchAllergy))
  );
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Patient Data API Server is running' });
});

app.get('/api/patients', (req, res) => {
  try {
    const patients = get_all_patients();
    res.json({ success: true, data: patients, count: patients.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/patients/:id', (req, res) => {
  try {
    const patient = get_patient_by_id(req.params.id);
    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

app.get('/api/patients/search/:query', (req, res) => {
  try {
    const { query } = req.params;
    const { field } = req.query;
    const results = search_patients(query, field || null);
    res.json({ success: true, data: results, count: results.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/patients/blood-type/:bloodType', (req, res) => {
  try {
    const { bloodType } = req.params;
    const results = get_patients_by_blood_type(bloodType);
    res.json({ success: true, data: results, count: results.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/patients/allergy/:allergy', (req, res) => {
  try {
    const { allergy } = req.params;
    const results = get_patients_by_allergy(allergy);
    res.json({ success: true, data: results, count: results.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET /api/patients - Get all patients`);
  console.log(`   GET /api/patients/:id - Get patient by ID`);
  console.log(`   GET /api/patients/search/:query - Search patients`);
  console.log(`   GET /api/patients/blood-type/:bloodType - Filter by blood type`);
  console.log(`   GET /api/patients/allergy/:allergy - Filter by allergy`);
});

