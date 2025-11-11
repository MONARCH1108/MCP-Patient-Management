# Patient Data Management System

A full-stack application with an MCP (Model Context Protocol) server backend and a React frontend for managing and querying patient data. Features an AI-powered chatbot that uses Groq LLM to intelligently query patient data through MCP tools.

## Project Structure

```
MCP-Medical-Agent/
├── backend/              # Backend services
│   ├── server.js         # MCP server (stdio transport)
│   ├── mcp-bridge.js     # MCP Bridge Server (HTTP to MCP stdio)
│   ├── api-server.js     # Alternative API server (direct data access)
│   ├── data.json         # Patient data
│   ├── cli-test.js       # CLI testing tool
│   ├── CHECK_ENV.js      # Environment variable checker
│   ├── SETUP_ENV.md      # Environment setup guide
│   ├── test-server.js    # Test server
│   └── package.json
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── Chatbot.jsx
│   │   │   ├── PatientList.jsx
│   │   │   ├── PatientById.jsx
│   │   │   ├── PatientSearch.jsx
│   │   │   ├── PatientsByBloodType.jsx
│   │   │   ├── PatientsByAllergy.jsx
│   │   │   └── PatientCard.jsx
│   │   ├── services/     # API service
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
├── package.json          # Root package.json with convenience scripts
├── README.md             # This file
└── TROUBLESHOOTING.md    # Troubleshooting guide
```

## Features

### Backend
- **MCP Server** (`server.js`): Exposes patient data as MCP tools and resources (stdio transport)
- **MCP Bridge Server** (`mcp-bridge.js`): HTTP bridge that forwards requests to MCP server via stdio (JSON-RPC)
- **AI Chat Integration**: Groq LLM with function calling that automatically invokes MCP tools
- **Environment Checker** (`CHECK_ENV.js`): Utility to verify .env configuration
- **5 Patient Query Tools**:
  1. `get_all_patients` - Get all patient records (takes no arguments)
  2. `get_patient_by_id` - Get a specific patient by ID (e.g., P001)
  3. `search_patients` - Search patients by name, email, or ID
  4. `get_patients_by_blood_type` - Filter patients by blood type
  5. `get_patients_by_allergy` - Find patients with specific allergies

### Frontend
- **Modern React UI** with tabbed interface (6 tabs: AI Chat, All Patients, By ID, Search, Blood Type, Allergy)
- **AI Chatbot** with Groq LLM that intelligently calls MCP tools based on user queries
- **Real-time patient data queries** with loading states and error handling
- **Beautiful, responsive design** with modern CSS
- **Patient cards** with detailed information display
- **Multiple query interfaces** for different use cases

## Installation

### 1. Environment Setup

Create a `.env` file in the `backend/` directory with your Groq API key:

```bash
cd backend
echo "GROQ_API_KEY=your_groq_api_key_here" > .env
```

**Important**: Replace `your_groq_api_key_here` with your actual Groq API key. The format should be:
```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
(No spaces around the `=` sign)

You can get a Groq API key from: https://console.groq.com/

**Verify your environment setup:**
```bash
cd backend
npm run check-env
```

This will verify that your `.env` file is configured correctly.

For detailed setup instructions, see `backend/SETUP_ENV.md`.

### 2. Install Dependencies

### Option 1: Install All Dependencies at Once
```bash
npm run install:all
```

### Option 2: Install Separately

1. **Install root dependencies:**
```bash
npm install
```

2. **Install backend dependencies:**
```bash
cd backend
npm install
cd ..
```

3. **Install frontend dependencies:**
```bash
cd frontend
npm install
cd ..
```

## Running the Application

### Development Mode (Both Backend & Frontend)

Run both the API server and React frontend simultaneously:
```bash
npm run dev
```

This will start:
- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:5173 (or another port if 5173 is busy)

### Run Separately

**Backend MCP Bridge Server:**
```bash
npm run backend:bridge
# or
cd backend
npm run bridge
```

**React Frontend:**
```bash
npm run frontend
# or
cd frontend
npm run dev
```

**MCP Server (for MCP clients, stdio transport):**
```bash
npm run backend:mcp
# or
cd backend
npm start
```

**Check Environment Configuration:**
```bash
cd backend
npm run check-env
```

## API Endpoints (MCP Bridge)

The MCP Bridge server provides HTTP endpoints that internally call MCP tools:

- `GET /api/health` - Health check
- `GET /api/patients` - Calls MCP tool: `get_all_patients`
- `GET /api/patients/:id` - Calls MCP tool: `get_patient_by_id`
- `GET /api/patients/search/:query?field=firstName` - Calls MCP tool: `search_patients`
- `GET /api/patients/blood-type/:bloodType` - Calls MCP tool: `get_patients_by_blood_type`
- `GET /api/patients/allergy/:allergy` - Calls MCP tool: `get_patients_by_allergy`
- `POST /api/chat` - Chat with Groq LLM that can automatically call MCP tools

**Note**: All HTTP requests are forwarded to the MCP server via stdio using JSON-RPC protocol. The MCP server processes the tool calls and returns results.

**Chat Endpoint**: The `/api/chat` endpoint uses Groq's LLM (llama-3.1-8b-instant) with function calling. When you ask questions about patients, the LLM automatically calls the appropriate MCP tools to retrieve the information. The LLM understands natural language queries and maps them to the correct MCP tools.

**Example Chat Queries:**
- "Show me all patients"
- "What patients have A+ blood type?"
- "Find patients allergic to Penicillin"
- "Get patient P001"
- "Search for patients named John"

## Using the MCP Server

The MCP server (`backend/server.js`) uses stdio transport and is designed to work with MCP clients like Claude Desktop.

### MCP Client Configuration

Add to your MCP configuration file (e.g., for Claude Desktop):

**Windows:**
```json
{
  "mcpServers": {
    "patient-data": {
      "command": "node",
      "args": ["C:\\path\\to\\MCP-Medical-Agent\\backend\\server.js"]
    }
  }
}
```

**macOS/Linux:**
```json
{
  "mcpServers": {
    "patient-data": {
      "command": "node",
      "args": ["/path/to/MCP-Medical-Agent/backend/server.js"]
    }
  }
}
```

**Note**: Replace the path with the actual absolute path to your `server.js` file.

### CLI Testing

You can test the tools using the CLI script:

```bash
cd backend
node cli-test.js get_all_patients
node cli-test.js get_patient_by_id P001
node cli-test.js search_patients John
node cli-test.js get_patients_by_blood_type A+
node cli-test.js get_patients_by_allergy Penicillin
```

## Data Structure

The patient data is stored in `backend/data.json` with the following structure:

- `id`: Patient ID (e.g., P001)
- `firstName`, `lastName`: Patient name
- `dateOfBirth`: Date of birth
- `gender`: Gender
- `bloodType`: Blood type (A+, O-, etc.)
- `email`, `phone`: Contact information
- `address`: Address object (street, city, state, zipCode)
- `emergencyContact`: Emergency contact information
- `medicalHistory`: Array of medical conditions
- `allergies`: Array of allergies
- `lastVisit`: Last visit date

## Technologies Used

### Backend
- **Node.js** (ES Modules)
- **Express.js** - HTTP server framework
- **@modelcontextprotocol/sdk** (v0.5.0) - MCP protocol implementation
- **groq-sdk** (v0.3.0) - Groq LLM API client
- **dotenv** (v16.3.1) - Environment variable management
- **cors** - Cross-origin resource sharing

### Frontend
- **React 19** - UI framework
- **Vite 7** - Build tool and dev server
- **Modern CSS** - Responsive design with flexbox/grid
- **ESLint** - Code linting

### Development Tools
- **concurrently** - Run multiple npm scripts simultaneously

## Development

### Adding New Features

1. **Backend MCP Tools**: 
   - Add tool definition in `backend/server.js` (ListToolsRequestSchema handler)
   - Add tool implementation in `backend/server.js` (CallToolRequestSchema handler)
   - Add tool to Groq function definitions in `backend/mcp-bridge.js` (mcpTools array)
   - Add API endpoint in `backend/mcp-bridge.js` (optional, for direct HTTP access)

2. **Frontend Components**: 
   - Create new components in `frontend/src/components/`
   - Add new tab in `frontend/src/App.jsx`
   - Update API service in `frontend/src/services/api.js` if needed

### Project Scripts

**Root Level:**
- `npm run install:all` - Install all dependencies (root, backend, frontend)
- `npm run dev` - Run both backend bridge and frontend simultaneously
- `npm run backend:bridge` - Run MCP Bridge Server (HTTP API)
- `npm run backend:mcp` - Run MCP Server only (stdio transport)
- `npm run frontend` - Run React frontend only

**Backend Scripts:**
- `npm start` - Run MCP server (stdio)
- `npm run bridge` - Run MCP Bridge Server (HTTP)
- `npm run check-env` - Verify .env configuration
- `npm run test-server` - Run test server

**Frontend Scripts:**
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Troubleshooting

If you encounter issues, check the `TROUBLESHOOTING.md` file for common problems and solutions.

Common issues:
- Backend server not running
- Missing or incorrect `.env` file
- Port conflicts (3001 for backend, 5173 for frontend)
- Missing dependencies

Use `npm run check-env` in the backend directory to verify your environment setup.

## Additional Resources

- **Environment Setup**: See `backend/SETUP_ENV.md` for detailed .env configuration
- **Troubleshooting**: See `TROUBLESHOOTING.md` for common issues and solutions
- **MCP Protocol**: Learn more at https://modelcontextprotocol.io/
- **Groq API**: Get your API key at https://console.groq.com/

## License

ISC
