// Quick script to check if .env file is configured correctly
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');

console.log('Checking .env configuration...\n');
console.log(`Looking for .env file at: ${envPath}\n`);

// Check if file exists
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file does not exist!');
  console.log('\nTo create it, run:');
  console.log(`  echo GROQ_API_KEY=your_key_here > ${envPath}`);
  process.exit(1);
}

console.log('✅ .env file exists');

// Try to load it
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Error loading .env file:', result.error.message);
  process.exit(1);
}

// Check for GROQ_API_KEY
if (process.env.GROQ_API_KEY) {
  const keyLength = process.env.GROQ_API_KEY.length;
  const keyPreview = process.env.GROQ_API_KEY.substring(0, 7) + '...' + process.env.GROQ_API_KEY.substring(keyLength - 4);
  console.log('✅ GROQ_API_KEY is set');
  console.log(`   Key preview: ${keyPreview}`);
  console.log(`   Key length: ${keyLength} characters`);
  
  if (process.env.GROQ_API_KEY === 'your_api_key_here' || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
    console.warn('\n⚠️  WARNING: You still have the placeholder value!');
    console.warn('   Please replace it with your actual Groq API key.');
  } else if (process.env.GROQ_API_KEY.trim() === '') {
    console.error('\n❌ ERROR: GROQ_API_KEY is empty!');
    process.exit(1);
  } else {
    console.log('\n✅ Configuration looks good!');
  }
} else {
  console.error('❌ GROQ_API_KEY is not set in .env file');
  console.log('\nYour .env file should contain:');
  console.log('GROQ_API_KEY=your_actual_api_key_here');
  console.log('\nMake sure:');
  console.log('- There are no spaces around the = sign');
  console.log('- The key is on a single line');
  console.log('- There are no quotes around the key');
  process.exit(1);
}

