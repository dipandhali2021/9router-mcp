# 9router Production MCP Server

A high-performance, modular, and production-ready implementation of the Model Context Protocol (MCP) server for 9router. Built natively with Node.js v22 over standard I/O (stdio) with zero dependencies.

Fully compatible with **Claude Code**, **Codex**, **Roo Code**, and **Claude Desktop**.

---

## 🚀 Instant Usage with `npx`

No installation required! Anyone can run your MCP server instantly via `npx`.

### 1. VS Code / Roo Code / Cline Configuration
Add the following to your global MCP settings (e.g., `~/.vscode/global-mcp-settings.json`):

```json
{
  "mcpServers": {
    "9router": {
      "command": "npx",
      "args": [
        "-y",
        "9router-mcp@latest"
      ],
      "env": {
        "ROUTER_API_KEY": "your_9router_api_key_here",
        "ROUTER_BASE_URL": "your_9router_base_url_here" 
      }
    }
  }
}
```
*(Note: `ROUTER_BASE_URL` is optional. It defaults to `your_9router_base_url_here`)*

### 2. Claude Desktop Configuration
Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "9router-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "9router-mcp"
      ],
      "env": {
        "ROUTER_API_KEY": "your_actual_9router_api_key_here",
        "ROUTER_BASE_URL": "your_9router_base_url_here"
      }
    }
  }
}
```

### 3. Registering in Claude Code CLI
```bash
claude mcp add --scope user 9router-search -e ROUTER_API_KEY=your_key -e ROUTER_BASE_URL=your_9router_base_url_here -- npx -y 9router-mcp
```

### 4. Registering in Codex CLI
```bash
codex mcp add 9router-search --env ROUTER_API_KEY=your_key --env ROUTER_BASE_URL=your_9router_base_url_here -- npx -y 9router-mcp
```

---

## 🛠️ Local Installation & Development

If you prefer to clone the repository and run it locally:

### 1. Clone & Setup
```bash
git clone https://github.com/dipandhali2021/9router-mcp.git
cd 9router-mcp
```

### 2. Setup Local Environment File
Create a `.env` file in the root of the project:
```bash
ROUTER_API_KEY=your_actual_9router_api_key_here
ROUTER_BASE_URL=your_9router_base_url_here
```

### 3. Run Locally
```bash
node index.js
```

---

## Tool API Specifications

### 1. `websearch`
- **Description**: Queries web searches using the 9router Search API and formats result lists (titles, URLs, snippets).
- **Parameters**:
  - `query` (string, required): The search query text.
  - `max_results` (number, optional, default: `5`): Maximum search matches.

### 2. `webfetch`
- **Description**: Fetches any webpage content natively converted into clean Markdown using Firecrawl.
- **Parameters**:
  - `url` (string, required): Full HTTP/HTTPS website URL.

### 3. `get_embeddings`
- **Description**: Generates a numerical vector embedding for any input text.
- **Parameters**:
  - `input` (string, required): The text to embed.
  - `model` (string, optional, default: `gemini/gemini-embedding-2-preview`): Embedding model.

### 4. `generate_image`
- **Description**: Generates an image via a detailed text prompt and downloads it locally.
- **Parameters**:
  - `prompt` (string, required): Detailed visual description of what the image should contain.
  - `output_path` (string, optional, default: `generated.png`): Local filepath where the PNG should be saved.
  - `model` (string, optional, default: `cf/@cf/black-forest-labs/flux-2-dev`): Image generation model.

### 5. `text_to_speech`
- **Description**: Synthesizes highly realistic audio speech from a text input and saves it locally.
- **Parameters**:
  - `text` (string, required): Text content to voice.
  - `filepath` (string, optional, default: `speech.mp3`): Destination audio filepath.
  - `model` (string, optional, default: `google-tts/en`): Text-to-speech voice model.

### 6. `speech_to_text`
- **Description**: Transcribes a local audio file (MP3, WAV, etc.) into clean plain text.
- **Parameters**:
  - `filepath` (string, required): Local audio filepath.
  - `model` (string, optional, default: `groq/whisper-large-v3`): Transcription model.

### 7. `get_health`
- **Description**: Checks endpoint reachability, credentials authorization status, and network latency metrics.
