#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Create MCP server
const server = new Server(
  {
    name: 'patient-data-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_all_patients',
        description: 'Get all patient records from the database',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_patient_by_id',
        description: 'Get a specific patient record by their ID',
        inputSchema: {
          type: 'object',
          properties: {
            patientId: {
              type: 'string',
              description: 'The patient ID (e.g., P001, P002)',
            },
          },
          required: ['patientId'],
        },
      },
      {
        name: 'search_patients',
        description: 'Search patients by name, email, or other criteria',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query to match against patient names, emails, or IDs',
            },
            field: {
              type: 'string',
              description: 'Optional field to search in (firstName, lastName, email, id)',
              enum: ['firstName', 'lastName', 'email', 'id'],
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_patients_by_blood_type',
        description: 'Get all patients with a specific blood type',
        inputSchema: {
          type: 'object',
          properties: {
            bloodType: {
              type: 'string',
              description: 'Blood type to filter by (e.g., A+, O-, AB+)',
            },
          },
          required: ['bloodType'],
        },
      },
      {
        name: 'get_patients_by_allergy',
        description: 'Get all patients with a specific allergy',
        inputSchema: {
          type: 'object',
          properties: {
            allergy: {
              type: 'string',
              description: 'Allergy to search for (e.g., Penicillin, Pollen)',
            },
          },
          required: ['allergy'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_all_patients': {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(patientData.patients, null, 2),
            },
          ],
        };
      }

      case 'get_patient_by_id': {
        const { patientId } = args;
        const patient = patientData.patients.find((p) => p.id === patientId);
        
        if (!patient) {
          return {
            content: [
              {
                type: 'text',
                text: `Patient with ID ${patientId} not found.`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(patient, null, 2),
            },
          ],
        };
      }

      case 'search_patients': {
        const { query, field } = args;
        const searchQuery = query.toLowerCase();
        
        let results = patientData.patients.filter((patient) => {
          if (field) {
            const value = String(patient[field] || '').toLowerCase();
            return value.includes(searchQuery);
          } else {
            // Search across multiple fields
            return (
              patient.id.toLowerCase().includes(searchQuery) ||
              patient.firstName.toLowerCase().includes(searchQuery) ||
              patient.lastName.toLowerCase().includes(searchQuery) ||
              patient.email.toLowerCase().includes(searchQuery)
            );
          }
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      case 'get_patients_by_blood_type': {
        const { bloodType } = args;
        const results = patientData.patients.filter(
          (patient) => patient.bloodType === bloodType
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      case 'get_patients_by_allergy': {
        const { allergy } = args;
        const searchAllergy = allergy.toLowerCase();
        const results = patientData.patients.filter((patient) =>
          patient.allergies.some((a) => a.toLowerCase().includes(searchAllergy))
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error executing tool ${name}: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'patient://all',
        name: 'All Patients',
        description: 'Complete list of all patient records',
        mimeType: 'application/json',
      },
      {
        uri: 'patient://summary',
        name: 'Patient Summary',
        description: 'Summary statistics of patient data',
        mimeType: 'application/json',
      },
    ],
  };
});

// Handle resource reads
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  try {
    if (uri === 'patient://all') {
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(patientData.patients, null, 2),
          },
        ],
      };
    }

    if (uri === 'patient://summary') {
      const summary = {
        totalPatients: patientData.patients.length,
        bloodTypes: {},
        genders: {},
        totalAllergies: 0,
        patientsWithAllergies: 0,
        patientsWithoutAllergies: 0,
      };

      patientData.patients.forEach((patient) => {
        // Count blood types
        summary.bloodTypes[patient.bloodType] =
          (summary.bloodTypes[patient.bloodType] || 0) + 1;

        // Count genders
        summary.genders[patient.gender] =
          (summary.genders[patient.gender] || 0) + 1;

        // Count allergies
        if (patient.allergies.length > 0) {
          summary.patientsWithAllergies++;
          summary.totalAllergies += patient.allergies.length;
        } else {
          summary.patientsWithoutAllergies++;
        }
      });

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(summary, null, 2),
          },
        ],
      };
    }

    // Handle patient://{id} pattern
    if (uri.startsWith('patient://')) {
      const patientId = uri.replace('patient://', '');
      if (patientId !== 'all' && patientId !== 'summary') {
        const patient = patientData.patients.find((p) => p.id === patientId);
        if (patient) {
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(patient, null, 2),
              },
            ],
          };
        }
      }
    }

    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: `Resource not found: ${uri}`,
        },
      ],
      isError: true,
    };
  } catch (error) {
    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: `Error reading resource: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Patient Data MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});

