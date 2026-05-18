const { ENDPOINTS, DEFAULTS, getHeaders } = require('../config');

module.exports = {
  definition: {
    name: 'get_embeddings',
    description: 'Generates numerical embeddings vector for any given input text.',
    inputSchema: {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'The text input to generate embeddings for' },
        model: { type: 'string', description: 'The embedding model to use', default: 'gemini/gemini-embedding-2-preview' }
      },
      required: ['input']
    }
  },
  
  async execute(args) {
    const { input, model } = args;
    if (!input || typeof input !== 'string' || input.trim() === '') {
      throw new Error("Validation Error: 'input' must be a non-empty string.");
    }
    
    const embeddingModel = model || DEFAULTS.embeddingModel;
    
    const response = await fetch(ENDPOINTS.embeddings, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        model: embeddingModel,
        input: input.trim()
      })
    });
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`9router Embeddings API responded with status ${response.status}: ${errText}`);
    }
    
    const data = await response.json();
    const embedding = data.data && data.data[0] ? data.data[0].embedding : [];
    
    if (embedding.length === 0) {
      return "Embedding generation returned empty vector.";
    }
    
    return `Generated embedding vector with ${embedding.length} dimensions.\nSample (first 10 elements): [${embedding.slice(0, 10).join(', ')}, ...]`;
  }
};
