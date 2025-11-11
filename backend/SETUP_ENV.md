# Setting Up Environment Variables

## Step 1: Create .env file

Create a file named `.env` in the `backend/` folder.

## Step 2: Add your Groq API Key

Open the `.env` file and add:

```
GROQ_API_KEY=your_groq_api_key_here
```

Replace `your_groq_api_key_here` with your actual Groq API key.

## Step 3: Get a Groq API Key

If you don't have a Groq API key:

1. Go to https://console.groq.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and paste it in your `.env` file

## Step 4: Restart the Server

After creating/updating the `.env` file, restart the backend server:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run backend:bridge
```

## Example .env file

Your `backend/.env` file should look like this:

```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Important:**
- Never commit the `.env` file to git (it's already in .gitignore)
- Keep your API key secret
- Don't share your API key publicly

