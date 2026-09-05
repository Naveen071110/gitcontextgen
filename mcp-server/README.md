# GitContextGen MCP Server ⚡
> Official Model Context Protocol (MCP) Server for dynamic codebase analysis, IDE rule generation, architecture visualization, and changelog synthesis.

The **GitContextGen MCP Server** connects any MCP-compatible AI agent (Claude Code, Cursor, Windsurf, Copilot, Antigravity) directly into GitContextGen's in-memory codebase analyzer.

Instead of stuffing thousands of lines of documentation into the LLM context window upfront, the AI agent dynamically queries repository boundaries, execution scripts, architecture diagrams, and release notes **only when needed**, saving up to 90% in token consumption.

---

## 🛠️ Registered Tools

| Tool Name | Parameters | Description |
| :--- | :--- | :--- |
| `gitcontextgen_analyze` | `path` (string, req), `exclude` (string[], opt) | Analyzes local filesystem directory or public GitHub URL and returns an indexed manifest. |
| `gitcontextgen_get_rules` | `path` (string, req), `format` (enum, req) | Generates zero-hallucination context rules for `claude`, `cursor`, `copilot`, `windsurf`, or `universal` (`AGENTS.md`). |
| `gitcontextgen_get_architecture` | `path` (string, req), `style` (string, opt) | Generates Mermaid.js architecture diagrams and serverless Kroki SVG/PNG links. |
| `gitcontextgen_get_changelog` | `path` (string, req), `from_commit` (string, opt), `tone` (enum, opt) | Parses local git commit history and generates audience-aware release notes. |

---

## 🚀 Quick Setup & Configuration

### 1. Claude Code (`~/.claude.json`)
Add the server entry to your Claude Code configuration:
```json
{
  "mcpServers": {
    "gitcontextgen": {
      "command": "npx",
      "args": ["-y", "@gitcontextgen/core", "mcp"]
    }
  }
}
```

### 2. Cursor (`.cursor/rules` or Cursor Settings)
1. Open **Cursor Settings > Features > MCP Servers**.
2. Click **Add New MCP Server**.
3. Set **Type** to `command`.
4. Enter:
   - **Name**: `GitContextGen`
   - **Command**: `npx -y @gitcontextgen/core mcp`

### 3. Antigravity (`~/.gemini/config/mcp_config.json` or project `.agents/`)
Add to `mcp_config.json`:
```json
{
  "mcpServers": {
    "gitcontextgen": {
      "command": "npx",
      "args": ["-y", "@gitcontextgen/core", "mcp"]
    }
  }
}
```

### 4. Windsurf (`~/.codeium/windsurf/mcp_config.json`)
```json
{
  "mcpServers": {
    "gitcontextgen": {
      "command": "npx",
      "args": ["-y", "@gitcontextgen/core", "mcp"]
    }
  }
}
```

---

## 💻 Local Development & Testing

```bash
# Navigate to mcp-server directory
cd mcp-server

# Install dependencies
npm install

# Compile TypeScript
npm run build

# Test running locally over stdio
npm start
```

---

## 📄 License
MIT © GitContextGen Team
