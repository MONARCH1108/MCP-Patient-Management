import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from the backend directory
const envPath = path.join(__dirname, '.env');
const envResult = dotenv.config({ path: envPath });

// Debug: Check if GROQ_API_KEY is loaded (don't log the actual key)
if (process.env.GROQ_API_KEY) {
  console.log('✅ GROQ_API_KEY loaded successfully');
} else {
  console.warn('⚠️  GROQ_API_KEY not found in environment variables');
  console.warn(`   Looking for .env file at: ${envPath}`);
  if (envResult.error) {
    console.warn(`   Error loading .env: ${envResult.error.message}`);
  }
  console.warn('   Make sure .env file exists and contains: GROQ_API_KEY=your_key_here');
  console.warn('   Format should be: GROQ_API_KEY=gsk_xxxxxxxxxxxxx (no spaces around =)');
}

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MCP Client class to communicate with MCP server via stdio
class MCPClient {
  constructor() {
    this.requestId = 0;
  }

  async callTool(toolName, args = {}) {
    return new Promise((resolve, reject) => {
      const serverPath = path.join(__dirname, 'server.js');
      const server = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let responses = [];
      let initialized = false;

      server.stdout.on('data', (data) => {
        const text = data.toString();
        stdout += text;
        const lines = text.split('\n').filter(l => l.trim());
        
        lines.forEach(line => {
          try {
            const json = JSON.parse(line.trim());
            if (json.id !== undefined) {
              responses.push(json);
            }
          } catch (e) {
            // Not JSON, ignore
          }
        });
      });

      server.stderr.on('data', (data) => {
        // Ignore stderr for now
      });

      // Initialize the MCP connection
      const initRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'mcp-bridge',
            version: '1.0.0'
          }
        }
      };

      server.stdin.write(JSON.stringify(initRequest) + '\n');

      // Wait for initialize response, then send initialized notification
      setTimeout(() => {
        const initializedNotification = {
          jsonrpc: '2.0',
          method: 'notifications/initialized'
        };
        server.stdin.write(JSON.stringify(initializedNotification) + '\n');

        // Now send the tool call
        setTimeout(() => {
          const toolRequest = {
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/call',
            params: {
              name: toolName,
              arguments: args
            }
          };
          server.stdin.write(JSON.stringify(toolRequest) + '\n');
          
          // Wait for response with timeout
          const timeout = setTimeout(() => {
            server.stdin.end();
            server.kill();
            reject(new Error('MCP server response timeout'));
          }, 5000);

          // Check for responses periodically
          const checkInterval = setInterval(() => {
            const toolResponse = responses.find(r => r.id === 2);
            if (toolResponse) {
              clearTimeout(timeout);
              clearInterval(checkInterval);
              server.stdin.end();
              server.kill();
              
              if (toolResponse.error) {
                reject(new Error(toolResponse.error.message || 'MCP tool call failed'));
              } else if (toolResponse.result) {
                // Parse the result content
                const content = toolResponse.result.content;
                if (content && content[0] && content[0].text) {
                  try {
                    const data = JSON.parse(content[0].text);
                    resolve({
                      success: true,
                      data: data,
                      isError: toolResponse.result.isError || false
                    });
                  } catch (e) {
                    // If not JSON, return as text
                    resolve({
                      success: true,
                      data: content[0].text,
                      isError: toolResponse.result.isError || false
                    });
                  }
                } else {
                  resolve({
                    success: true,
                    data: toolResponse.result
                  });
                }
              } else {
                reject(new Error('Invalid MCP response format'));
              }
            }
          }, 100);

          // Final check after delay
          setTimeout(() => {
            clearTimeout(timeout);
            clearInterval(checkInterval);
            server.stdin.end();
            server.kill();
            
            const toolResponse = responses.find(r => r.id === 2);
            if (toolResponse) {
              if (toolResponse.error) {
                reject(new Error(toolResponse.error.message || 'MCP tool call failed'));
              } else if (toolResponse.result) {
                const content = toolResponse.result.content;
                if (content && content[0] && content[0].text) {
                  try {
                    const data = JSON.parse(content[0].text);
                    resolve({
                      success: true,
                      data: data,
                      isError: toolResponse.result.isError || false
                    });
                  } catch (e) {
                    resolve({
                      success: true,
                      data: content[0].text,
                      isError: toolResponse.result.isError || false
                    });
                  }
                } else {
                  resolve({
                    success: true,
                    data: toolResponse.result
                  });
                }
              }
            } else if (responses.length > 0) {
              const lastResponse = responses[responses.length - 1];
              if (lastResponse.error) {
                reject(new Error(lastResponse.error.message || 'MCP tool call failed'));
              } else {
                resolve({
                  success: true,
                  data: lastResponse.result
                });
              }
            } else {
              reject(new Error('No response from MCP server'));
            }
          }, 1000);
        }, 200);
      }, 200);
    });
  }
}

const mcpClient = new MCPClient();

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

// Define MCP tools as Groq functions
// Note: Groq uses OpenAI-compatible function calling format
const mcpTools = [
  {
    type: 'function',
    function: {
      name: 'get_all_patients',
      description: 'Get all patient records from the database. This function takes NO arguments - call it with an empty object {}. Use this when the user asks to see all patients, list all patients, or get all patient records. Returns all patients in the system.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_patient_by_id',
      description: 'Get a specific patient record by their ID (e.g., P001, P002)',
      parameters: {
        type: 'object',
        properties: {
          patientId: {
            type: 'string',
            description: 'The patient ID (e.g., P001, P002)'
          }
        },
        required: ['patientId']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_patients',
      description: 'Search patients by name, email, or ID',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query to match against patient names, emails, or IDs'
          },
          field: {
            type: 'string',
            description: 'Optional field to search in (firstName, lastName, email, id)',
            enum: ['firstName', 'lastName', 'email', 'id']
          }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_patients_by_blood_type',
      description: 'Get all patients with a specific blood type (e.g., A+, O-, AB+)',
      parameters: {
        type: 'object',
        properties: {
          bloodType: {
            type: 'string',
            description: 'Blood type to filter by (e.g., A+, O-, AB+)'
          }
        },
        required: ['bloodType']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_patients_by_allergy',
      description: 'Get all patients with a specific allergy (e.g., Penicillin, Pollen)',
      parameters: {
        type: 'object',
        properties: {
          allergy: {
            type: 'string',
            description: 'Allergy to search for (e.g., Penicillin, Pollen)'
          }
        },
        required: ['allergy']
      }
    }
  }
];

// API Routes that call MCP tools
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MCP Bridge Server is running' });
});

app.get('/api/patients', async (req, res) => {
  try {
    const result = await mcpClient.callTool('get_all_patients', {});
    if (result.isError) {
      res.status(500).json({ success: false, error: result.data });
    } else {
      res.json({ success: true, data: result.data, count: Array.isArray(result.data) ? result.data.length : 0 });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/patients/:id', async (req, res) => {
  try {
    const result = await mcpClient.callTool('get_patient_by_id', { patientId: req.params.id });
    if (result.isError) {
      res.status(404).json({ success: false, error: result.data });
    } else {
      res.json({ success: true, data: result.data });
    }
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

app.get('/api/patients/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { field } = req.query;
    const args = { query };
    if (field) {
      args.field = field;
    }
    const result = await mcpClient.callTool('search_patients', args);
    if (result.isError) {
      res.status(500).json({ success: false, error: result.data });
    } else {
      res.json({ success: true, data: result.data, count: Array.isArray(result.data) ? result.data.length : 0 });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/patients/blood-type/:bloodType', async (req, res) => {
  try {
    const result = await mcpClient.callTool('get_patients_by_blood_type', { bloodType: req.params.bloodType });
    if (result.isError) {
      res.status(500).json({ success: false, error: result.data });
    } else {
      res.json({ success: true, data: result.data, count: Array.isArray(result.data) ? result.data.length : 0 });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/patients/allergy/:allergy', async (req, res) => {
  try {
    const result = await mcpClient.callTool('get_patients_by_allergy', { allergy: req.params.allergy });
    if (result.isError) {
      res.status(500).json({ success: false, error: result.data });
    } else {
      res.json({ success: true, data: result.data, count: Array.isArray(result.data) ? result.data.length : 0 });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Chat endpoint with Groq and MCP tool calling
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'GROQ_API_KEY not configured. Please create a .env file in the backend folder with: GROQ_API_KEY=your_api_key_here' 
      });
    }

    // Build conversation messages
    const messages = [
      {
        role: 'system',
        content: `You are a helpful assistant for a patient data management system. 

WORKFLOW: When a user asks about patient data, you MUST:
1. FIRST: Call the appropriate tool to get the raw patient data
2. THEN: Process, filter, or extract the specific information the user requested from the tool results
3. FINALLY: Return only what the user asked for

EXAMPLE: If user asks "give me all patient names only":
- Step 1: Call 'get_all_patients' tool to get all patient data
- Step 2: Extract only the names (firstName + lastName) from the results
- Step 3: Return just the list of names

EXAMPLE: If user asks "show me patients with A+ blood type":
- Step 1: Call 'get_patients_by_blood_type' with {"bloodType": "A+"}
- Step 2: Return the filtered results

AVAILABLE TOOLS (you MUST call these to get data):
- 'get_all_patients' - Takes NO arguments (use {}). Returns all patients. Use when user asks for "all patients", "list patients", "show all", etc.
- 'get_patient_by_id' - Takes {"patientId": "P001"}. Returns one patient. Use when user asks for a specific patient ID.
- 'search_patients' - Takes {"query": "John"} or {"query": "John", "field": "firstName"}. Returns matching patients. Use when user searches by name/email.
- 'get_patients_by_blood_type' - Takes {"bloodType": "A+"}. Returns filtered patients. Use when user asks about blood types.
- 'get_patients_by_allergy' - Takes {"allergy": "Penicillin"}. Returns filtered patients. Use when user asks about allergies.

CRITICAL RULES:
- ALWAYS call tools first to get real data - NEVER simulate or make up data
- get_all_patients takes NO arguments - always use {}
- After getting tool results, extract/filter/format the data based on what user asked for
- If user asks for "names only", call the tool, then extract just the names from results
- If user asks for "count", call the tool, then count the results
- Process the tool results to match the user's specific request`
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    console.log('📤 Sending request to Groq with', mcpTools.length, 'tools available');

    // Call Groq with function calling
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: messages,
      tools: mcpTools,
      tool_choice: 'auto', // Let the model decide, but tools are available
      temperature: 0.3 // Lower temperature for more consistent tool usage
    });

    const assistantMessage = completion.choices[0].message;
    let finalResponse = assistantMessage.content || '';

    console.log('📥 Groq response:', {
      hasContent: !!assistantMessage.content,
      hasToolCalls: !!(assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0),
      toolCallCount: assistantMessage.tool_calls ? assistantMessage.tool_calls.length : 0
    });

    // If the LLM wants to call a tool, execute it
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log('🔧 Executing', assistantMessage.tool_calls.length, 'tool call(s)');
      const toolCalls = assistantMessage.tool_calls;
      const toolResults = [];

      for (const toolCall of toolCalls) {
        const toolName = toolCall.function.name;
        let toolArgs;
        
        try {
          toolArgs = JSON.parse(toolCall.function.arguments);
        } catch (parseError) {
          console.error('❌ Error parsing tool arguments:', parseError);
          toolArgs = {};
        }

        // Validate and clean arguments based on tool requirements
        if (toolName === 'get_all_patients') {
          // This tool takes no arguments - ignore any provided
          toolArgs = {};
          console.log(`⚠️  get_all_patients called with arguments, ignoring them (this tool takes no arguments)`);
        }

        console.log(`🔧 Calling tool: ${toolName} with args:`, toolArgs);

        try {
          // Call the MCP tool
          const mcpResult = await mcpClient.callTool(toolName, toolArgs);
          console.log(`✅ Tool ${toolName} executed successfully`);
          
          if (mcpResult.isError) {
            toolResults.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              name: toolName,
              content: `Error: ${mcpResult.data}`
            });
          } else {
            toolResults.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              name: toolName,
              content: JSON.stringify(mcpResult.data)
            });
          }
        } catch (error) {
          toolResults.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            name: toolName,
            content: `Error: ${error.message}`
          });
        }
      }

      // Get final response from Groq with tool results
      const finalMessages = [
        ...messages,
        assistantMessage,
        ...toolResults
      ];

      const finalCompletion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: finalMessages,
        temperature: 0.7
      });

      finalResponse = finalCompletion.choices[0].message.content || 'I retrieved the information, but could not format a response.';
    }

    res.json({
      success: true,
      message: finalResponse,
      toolCalls: assistantMessage.tool_calls || []
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Catch-all route for 404s - return JSON instead of HTML
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.path}`,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/patients',
      'GET /api/patients/:id',
      'GET /api/patients/search/:query',
      'GET /api/patients/blood-type/:bloodType',
      'GET /api/patients/allergy/:allergy',
      'POST /api/chat'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MCP Bridge Server running on http://localhost:${PORT}`);
  console.log(`📡 All requests are forwarded to MCP server via stdio`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET /api/health - Health check`);
  console.log(`   GET /api/patients - Calls MCP tool: get_all_patients`);
  console.log(`   GET /api/patients/:id - Calls MCP tool: get_patient_by_id`);
  console.log(`   GET /api/patients/search/:query - Calls MCP tool: search_patients`);
  console.log(`   GET /api/patients/blood-type/:bloodType - Calls MCP tool: get_patients_by_blood_type`);
  console.log(`   GET /api/patients/allergy/:allergy - Calls MCP tool: get_patients_by_allergy`);
  console.log(`   POST /api/chat - Chat with LLM that can call MCP tools`);
  console.log(`\n💡 Make sure GROQ_API_KEY is set in .env file for chat functionality`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error(`   Please stop the other process or change the PORT in mcp-bridge.js`);
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});

