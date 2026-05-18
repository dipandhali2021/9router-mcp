const fs = require('fs');
const path = require('path');
const { ENDPOINTS, DEFAULTS, getHeaders } = require('../config');

const textToSpeech = {
  definition: {
    name: 'text_to_speech',
    description: 'Converts text input into highly realistic speech audio and saves it as an MP3 file.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'The text to convert to speech' },
        filepath: { type: 'string', description: 'Destination local path where the speech MP3 should be saved (default: speech.mp3)', default: 'speech.mp3' },
        model: { type: 'string', description: 'Text-to-speech model', default: 'google-tts/en' }
      },
      required: ['text']
    }
  },
  
  async execute(args) {
    const { text, filepath, model } = args;
    if (!text || typeof text !== 'string' || text.trim() === '') {
      throw new Error("Validation Error: 'text' must be a non-empty string.");
    }
    
    const speechModel = model || DEFAULTS.speechModel;
    const destPath = filepath || 'speech.mp3';
    
    const response = await fetch(ENDPOINTS.speech, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ model: speechModel, input: text.trim() })
    });
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`9router Speech API responded with status ${response.status}: ${errText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    
    // Ensure parent directory exists
    const dir = path.dirname(destPath);
    if (dir !== '.' && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
    return `Successfully converted text to speech and saved to: ${destPath}`;
  }
};

const speechToText = {
  definition: {
    name: 'speech_to_text',
    description: 'Transcribes a local speech audio file (MP3, WAV, etc.) into plain text.',
    inputSchema: {
      type: 'object',
      properties: {
        filepath: { type: 'string', description: 'Local path of the audio file to transcribe' },
        model: { type: 'string', description: 'Transcription model', default: 'groq/whisper-large-v3' }
      },
      required: ['filepath']
    }
  },
  
  async execute(args) {
    const { filepath, model } = args;
    if (!filepath || typeof filepath !== 'string' || filepath.trim() === '') {
      throw new Error("Validation Error: 'filepath' must be a non-empty string.");
    }
    
    const absolutePath = path.resolve(filepath.trim());
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Audio file not found at: ${absolutePath}`);
    }
    
    const transcriptionModel = model || DEFAULTS.transcriptionModel;
    const bufferData = fs.readFileSync(absolutePath);
    const audioBlob = new Blob([bufferData], { type: 'audio/mp3' });
    
    const formData = new FormData();
    formData.append('file', audioBlob, path.basename(absolutePath));
    formData.append('model', transcriptionModel);
    formData.append('response_format', 'json');
    
    const response = await fetch(ENDPOINTS.transcriptions, {
      method: 'POST',
      headers: getHeaders(),
      body: formData
    });
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`9router Transcription API responded with status ${response.status}: ${errText}`);
    }
    
    const data = await response.json();
    const transcribedText = data.text || "No transcription text returned.";
    return transcribedText;
  }
};

module.exports = {
  textToSpeech,
  speechToText
};
