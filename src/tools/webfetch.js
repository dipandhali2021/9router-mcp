const { ENDPOINTS, DEFAULTS, getHeaders } = require('../config');

module.exports = {
  definition: {
    name: 'webfetch',
    description: 'Fetches the full text content of a webpage URL in a clean, readable Markdown format using the 9router Fetch API.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The URL of the webpage to fetch' }
      },
      required: ['url']
    }
  },
  
  async execute(args) {
    const { url } = args;
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      throw new Error("Validation Error: 'url' must be a valid HTTP/HTTPS URL.");
    }
    
    const response = await fetch(ENDPOINTS.fetch, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        model: DEFAULTS.fetchModel,
        url: url.trim(),
        format: 'markdown'
      })
    });
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`9router Fetch API responded with status ${response.status}: ${errText}`);
    }
    
    const data = await response.json();
    const contentText = data.content && data.content.text ? data.content.text : "No content returned.";
    
    return contentText;
  }
};
