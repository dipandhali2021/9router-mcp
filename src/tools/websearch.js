const { ENDPOINTS, DEFAULTS, getHeaders } = require('../config');

module.exports = {
  definition: {
    name: 'websearch',
    description: 'Searches the web for a query using the 9router Search API and returns a list of results (titles, URLs, snippets).',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The search query' },
        max_results: { type: 'number', description: 'Maximum number of search results to return (default: 5)', default: 5 }
      },
      required: ['query']
    }
  },
  
  async execute(args) {
    const { query, max_results } = args;
    if (!query || typeof query !== 'string' || query.trim() === '') {
      throw new Error("Validation Error: 'query' must be a non-empty string.");
    }
    
    const maxResults = Number(max_results) || 5;
    
    const response = await fetch(ENDPOINTS.search, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        model: DEFAULTS.searchModel,
        query: query.trim(),
        search_type: 'web',
        max_results: maxResults
      })
    });
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`9router Search API responded with status ${response.status}: ${errText}`);
    }
    
    const data = await response.json();
    const results = data.results || [];
    
    if (results.length === 0) {
      return `No search results found for: "${query}"`;
    }
    
    let formattedText = `Search results for "${query}":\n\n`;
    results.forEach((res, i) => {
      formattedText += `[${i + 1}] ${res.title || 'Untitled'}\n`;
      formattedText += `URL: ${res.url}\n`;
      if (res.snippet) {
        formattedText += `Snippet: ${res.snippet}\n`;
      }
      if (res.published_at) {
        formattedText += `Published: ${res.published_at}\n`;
      }
      formattedText += `\n`;
    });
    
    return formattedText.trim();
  }
};
