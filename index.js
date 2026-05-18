#!/usr/bin/env node

/**
 * 9router MCP Server Entrypoint
 */

const McpServer = require('./src/mcp-server');

const server = new McpServer();
server.start();
