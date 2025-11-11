# Troubleshooting Guide

## Error: "Server returned HTML instead of JSON. Status: 404"

This error means the backend server is not running or not accessible.

### Solution Steps:

1. **Check if the backend server is running:**
   ```bash
   # In the project root
   npm run backend:bridge
   
   # OR navigate to backend folder
   cd backend
   npm run bridge
   ```

2. **You should see:**
   ```
   🚀 MCP Bridge Server running on http://localhost:3001
   📡 All requests are forwarded to MCP server via stdio
   📊 Available endpoints:
      GET /api/health - Health check
      ...
   ```

3. **Test the server manually:**
   - Open your browser and go to: `http://localhost:3001/api/health`
   - You should see: `{"status":"ok","message":"MCP Bridge Server is running"}`

4. **If port 3001 is already in use:**
   - Stop any other process using port 3001
   - Or change the PORT in `backend/mcp-bridge.js` (line 15)

5. **Check if dependencies are installed:**
   ```bash
   cd backend
   npm install
   ```

6. **Make sure .env file exists:**
   ```bash
   cd backend
   # Create .env file with your Groq API key
   echo "GROQ_API_KEY=your_key_here" > .env
   ```

### Running Both Frontend and Backend:

```bash
# From project root - runs both servers
npm run dev
```

This will start:
- Backend on http://localhost:3001
- Frontend on http://localhost:5173

### Common Issues:

1. **Port already in use:** Another process is using port 3001
2. **Missing dependencies:** Run `npm install` in the backend folder
3. **Missing .env file:** Create `backend/.env` with `GROQ_API_KEY=your_key`
4. **Server not started:** Make sure you run `npm run backend:bridge` or `npm run dev`

