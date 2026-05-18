/**
 * Utility functions for the 9router MCP server.
 */

const fs = require('fs');

/**
 * Logs data to stderr safely.
 */
function logDebug(...args) {
  process.stderr.write(`[DEBUG] ${args.join(' ')}\n`);
}

function logError(...args) {
  process.stderr.write(`[ERROR] ${args.join(' ')}\n`);
}

/**
 * Formats a JSON-RPC 2.0 success response.
 */
function makeSuccessResponse(id, result) {
  return {
    jsonrpc: "2.0",
    id,
    result
  };
}

/**
 * Formats a JSON-RPC 2.0 error response.
 */
function makeErrorResponse(id, code, message, data = null) {
  const error = { code, message };
  if (data) error.data = data;
  return {
    jsonrpc: "2.0",
    id,
    error
  };
}

/**
 * Formats a standard MCP content return value.
 */
function makeContentResult(text, isError = false) {
  return {
    isError,
    content: [{ type: "text", text }]
  };
}

module.exports = {
  logDebug,
  logError,
  makeSuccessResponse,
  makeErrorResponse,
  makeContentResult
};
