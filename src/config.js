/**
 * Configuration and constants for the 9router MCP server.
 * Loads API key securely from environment variables or a local .env file.
 */

const fs = require('fs');
const path = require('path');

// 1. Try to load variables from a local .env file if it exists
function loadEnv() {
  const envPaths = [
    path.join(__dirname, '../.env'),
    path.join(__dirname, '../../../.env'),
    path.join(process.cwd(), '.env')
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...values] = trimmed.split('=');
            if (key) {
              const val = values.join('=').trim().replace(/^['"]|['"]$/g, '');
              process.env[key.trim()] = val;
            }
          }
        });
        break; // Successfully loaded from the first found .env file
      } catch (err) {
        // Silently ignore or log to stderr
      }
    }
  }
}

// Load env vars
loadEnv();

const API_KEY = process.env.ROUTER_API_KEY;
const BASE_URL = process.env.ROUTER_BASE_URL;

const ENDPOINTS = {
  search: `${BASE_URL}/search`,
  fetch: `${BASE_URL}/web/fetch`,
  embeddings: `${BASE_URL}/embeddings`,
  images: `${BASE_URL}/images/generations`,
  speech: `${BASE_URL}/audio/speech`,
  transcriptions: `${BASE_URL}/audio/transcriptions`,
  models: `${BASE_URL}/models`
};

const DEFAULTS = {
  searchModel: 'openclaw-search',
  fetchModel: 'openclaw-fetch',
  embeddingModel: 'gemini/gemini-embedding-2-preview',
  imageModel: 'cf/@cf/black-forest-labs/flux-2-dev',
  speechModel: 'google-tts/en',
  transcriptionModel: 'groq/whisper-large-v3'
};

function getHeaders(extraHeaders = {}) {
  if (!API_KEY || !BASE_URL) {
    throw new Error(
      "Missing 9router configuration (API Key or Base URL)!\n" +
      "Please set them using one of the following methods:\n" +
      "  1. Register with environment variables in your CLI:\n" +
      "     - Claude Code: \`claude mcp add --scope user 9router-search -e ROUTER_API_KEY=your_key -e ROUTER_BASE_URL=your_base_url -- npx -y 9router-mcp\`\n" +
      "     - Codex: \`codex mcp add 9router-search --env ROUTER_API_KEY=your_key --env ROUTER_BASE_URL=your_base_url -- npx -y 9router-mcp\`\n" +
      "  2. Create a \`.env\` file inside the 9router-mcp directory containing:\n" +
      "     ROUTER_API_KEY=your_key\n" +
      "     ROUTER_BASE_URL=your_base_url"
    );
  }
  return {
    "Authorization": \`Bearer ${API_KEY}\`,
    ...extraHeaders
  };
}

module.exports = {
  API_KEY,
  ENDPOINTS,
  DEFAULTS,
  getHeaders
};
