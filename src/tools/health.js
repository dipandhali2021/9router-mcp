const { ENDPOINTS, getHeaders } = require('../config');

module.exports = {
  definition: {
    name: 'get_health',
    description: 'Checks the connection health, credentials status, and query latency of the 9router API endpoints.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  
  async execute() {
    const start = Date.now();
    const response = await fetch(ENDPOINTS.models, {
      headers: getHeaders()
    });
    const latency = Date.now() - start;
    
    let status = "healthy";
    let message = "9router API is connected and responding normally.";
    if (!response.ok) {
      status = "unhealthy";
      message = `API returned error status ${response.status}: ${await response.text()}`;
    }
    
    return JSON.stringify({
      status,
      latency_ms: latency,
      message,
      endpoints_checked: {
        models_endpoint: ENDPOINTS.models,
        authorized: response.ok
      },
      timestamp: new Date().toISOString()
    }, null, 2);
  }
};
