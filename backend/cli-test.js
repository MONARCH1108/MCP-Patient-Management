#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load patient data
function loadPatientData() {
  const dataPath = path.join(__dirname, 'data.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(rawData);
}

const patientData = loadPatientData();

// Tool implementations (same as server.js)
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

// CLI interface
const command = process.argv[2];

try {
  let result;
  
  switch (command) {
    case 'get_all_patients':
      result = get_all_patients();
      console.log(JSON.stringify(result, null, 2));
      break;
      
    case 'get_patient_by_id':
      const patientId = process.argv[3];
      if (!patientId) {
        console.error('Error: patientId is required');
        console.log('Usage: node cli-test.js get_patient_by_id <patientId>');
        process.exit(1);
      }
      result = get_patient_by_id(patientId);
      console.log(JSON.stringify(result, null, 2));
      break;
      
    case 'search_patients':
      const query = process.argv[3];
      const field = process.argv[4] || null;
      if (!query) {
        console.error('Error: query is required');
        console.log('Usage: node cli-test.js search_patients <query> [field]');
        process.exit(1);
      }
      result = search_patients(query, field);
      console.log(JSON.stringify(result, null, 2));
      break;
      
    case 'get_patients_by_blood_type':
      const bloodType = process.argv[3];
      if (!bloodType) {
        console.error('Error: bloodType is required');
        console.log('Usage: node cli-test.js get_patients_by_blood_type <bloodType>');
        process.exit(1);
      }
      result = get_patients_by_blood_type(bloodType);
      console.log(JSON.stringify(result, null, 2));
      break;
      
    case 'get_patients_by_allergy':
      const allergy = process.argv[3];
      if (!allergy) {
        console.error('Error: allergy is required');
        console.log('Usage: node cli-test.js get_patients_by_allergy <allergy>');
        process.exit(1);
      }
      result = get_patients_by_allergy(allergy);
      console.log(JSON.stringify(result, null, 2));
      break;
      
    default:
      console.log('Available commands:');
      console.log('  node cli-test.js get_all_patients');
      console.log('  node cli-test.js get_patient_by_id <patientId>');
      console.log('  node cli-test.js search_patients <query> [field]');
      console.log('  node cli-test.js get_patients_by_blood_type <bloodType>');
      console.log('  node cli-test.js get_patients_by_allergy <allergy>');
      console.log('\nExamples:');
      console.log('  node cli-test.js get_all_patients');
      console.log('  node cli-test.js get_patient_by_id P001');
      console.log('  node cli-test.js search_patients John');
      console.log('  node cli-test.js get_patients_by_blood_type A+');
      console.log('  node cli-test.js get_patients_by_allergy Penicillin');
      process.exit(1);
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

