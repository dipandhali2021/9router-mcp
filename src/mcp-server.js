const { logDebug, logError, makeSuccessResponse, makeErrorResponse, makeContentResult } = require('./utils');

// Import all modular tools
const websearch = require('./tools/websearch');
const webfetch = require('./tools/webfetch');
const embeddings = require('./tools/embeddings');
const imagegen = require('./tools/imagegen');
const { textToSpeech, speechToText } = require('./tools/audio');
const health = require('./tools/health');

class McpServer {
  constructor() {
    this.tools = {};
    this.registerTool(websearch);
    this.registerTool(webfetch);
    this.registerTool(embeddings);
    this.registerTool(imagegen);
    this.registerTool(textToSpeech);
    this.registerTool(speechToText);
    this.registerTool(health);
  }

  registerTool(tool) {
    if (!tool || !tool.definition || !tool.definition.name || typeof tool.execute !== 'function') {
      logError(`Failed to register invalid tool structure.`);
      return;
    }
    this.tools[tool.definition.name] = tool;
  }

  start() {
    let buffer = '';
    process.stdin.on('data', chunk => {
      buffer += chunk.toString();
      let lineEnd;
      while ((lineEnd = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, lineEnd).trim();
        buffer = buffer.slice(lineEnd + 1);
        if (line) {
          this.handleRawRequest(line);
        }
      }
    });
    logDebug("9router modular MCP server successfully started.");
  }

  async handleRawRequest(line) {
    let request;
    try {
      request = JSON.parse(line);
    } catch (err) {
      sendResponse(makeErrorResponse(null, -32700, "Parse error: Invalid JSON string."));
      return;
    }

    const { method, id, params } = request;
    if (id === undefined && method !== 'notifications/initialized') {
      // It's a notification with no ID, ignore or handle standard notifications
      return;
    }

    try {
      await this.dispatchRequest(id, method, params);
    } catch (err) {
      logError(`Unhandled request dispatch error: ${err.message}`);
      sendResponse(makeErrorResponse(id, -32603, `Internal server error: ${err.message}`));
    }
  }

  async dispatchRequest(id, method, params) {
    if (method === 'initialize') {
      sendResponse(makeSuccessResponse(id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: {
          name: '9router-mcp-server',
          version: '1.0.0'
        }
      }));
      return;
    }

    if (method === 'notifications/initialized') {
      // Do nothing
      return;
    }

    if (method === 'tools/list') {
      const toolDefinitions = Object.values(this.tools).map(t => t.definition);
      sendResponse(makeSuccessResponse(id, { tools: toolDefinitions }));
      return;
    }

    if (method === 'tools/call') {
      const toolName = params && params.name;
      const toolArgs = (params && params.arguments) || {};
      
      const tool = this.tools[toolName];
      if (!tool) {
        sendResponse(makeErrorResponse(id, -32601, `Method not found: Tool '${toolName}' is not registered.`));
        return;
      }

      try {
        const resultText = await tool.execute(toolArgs);
        sendResponse(makeSuccessResponse(id, makeContentResult(resultText)));
      } catch (err) {
        logError(`Execution error inside tool '${toolName}': ${err.message}`);
        // Return structured isError: true result block for graceful model-side handling
        sendResponse(makeSuccessResponse(id, makeContentResult(`Error: ${err.message}`, true)));
      }
      return;
    }

    // Default JSON-RPC fallback
    sendResponse(makeErrorResponse(id, -32601, `Method not found: '${method}' is not supported.`));
  }
}

function sendResponse(response) {
  process.stdout.write(JSON.stringify(response) + '\n');
}

module.exports = McpServer;
