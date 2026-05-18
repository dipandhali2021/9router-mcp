const fs = require('fs');
const path = require('path');
const { ENDPOINTS, DEFAULTS, getHeaders } = require('../config');

module.exports = {
  definition: {
    name: 'generate_image',
    description: 'Generates an image from a detailed text prompt using 9router API and saves it locally.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Detailed prompt of what the image should contain' },
        output_path: { type: 'string', description: 'Local path where the generated PNG/JPG image should be saved (default: generated.png)', default: 'generated.png' },
        model: { type: 'string', description: 'Image generation model', default: 'cf/@cf/black-forest-labs/flux-2-dev' }
      },
      required: ['prompt']
    }
  },
  
  async execute(args) {
    const { prompt, output_path, model } = args;
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      throw new Error("Validation Error: 'prompt' must be a non-empty string.");
    }
    
    const imageModel = model || DEFAULTS.imageModel;
    const outputPath = output_path || 'generated.png';
    
    const response = await fetch(ENDPOINTS.images, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        model: imageModel,
        prompt: prompt.trim(),
        n: 1,
        size: "auto",
        quality: "auto",
        background: "auto",
        image_detail: "high",
        output_format: "png"
      })
    });
    
    if (!response.ok) {
      const errText = await response.text();
      let parsedErr;
      try {
        parsedErr = JSON.parse(errText);
      } catch (e) {}
      
      if (parsedErr && parsedErr.error && parsedErr.error.message) {
        throw new Error(parsedErr.error.message);
      }
      throw new Error(`9router Image Gen API responded with status ${response.status}: ${errText}`);
    }
    
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    const imageUrl = data.data && data.data[0] ? data.data[0].url : null;
    if (!imageUrl) {
      throw new Error("No image URL returned by the API.");
    }
    
    // Download and write the binary buffer safely
    const imgResponse = await fetch(imageUrl);
    if (!imgResponse.ok) {
      throw new Error(`Failed to download generated image from url ${imageUrl}`);
    }
    
    const arrayBuffer = await imgResponse.arrayBuffer();
    
    // Ensure parent directory exists
    const dir = path.dirname(outputPath);
    if (dir !== '.' && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));
    return `Successfully generated image and saved to: ${outputPath}`;
  }
};
