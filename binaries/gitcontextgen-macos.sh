#!/usr/bin/env sh
# GitContextGen Self-Contained Launcher for Unix/macOS
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
node "$SCRIPT_DIR/../mcp-server/dist/bin/cli.js" "$@"
