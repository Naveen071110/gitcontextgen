#!/usr/bin/env bash
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MCP_DIR="$REPO_ROOT/mcp-server"

echo "========================================================================"
echo "📦 Starting GitContextGen MCP Server Release & Packaging Pipeline"
echo "========================================================================"

cd "$REPO_ROOT"

# 1. Run MCP Verification Suite
echo ""
echo "🔍 Step 1: Running Automated MCP Stdio Verification Suite..."
node "$REPO_ROOT/scripts/verify-mcp.mjs"

# 2. Build MCP Server Distribution
echo ""
echo "🔨 Step 2: Compiling TypeScript into dist/..."
cd "$MCP_DIR"
npm run build

# 3. Ensure Executable Permissions and Hashbang
echo ""
echo "🔒 Step 3: Enforcing Executable Permissions & Hashbang..."
INDEX_FILE="$MCP_DIR/dist/index.js"
if [ ! -f "$INDEX_FILE" ]; then
  echo "❌ Error: $INDEX_FILE does not exist after build"
  exit 1
fi

# Ensure hashbang exists
if ! grep -q "^#!/usr/bin/env node" "$INDEX_FILE"; then
  echo "Injecting #!/usr/bin/env node hashbang..."
  echo -e "#!/usr/bin/env node\n$(cat "$INDEX_FILE")" > "$INDEX_FILE"
fi

chmod +x "$INDEX_FILE"
echo "✅ Permissions: dist/index.js is executable with #!/usr/bin/env node hashbang."

# 4. Version Increment
BUMP_TYPE="${1:-patch}"
echo ""
echo "🏷️  Step 4: Incrementing package version ($BUMP_TYPE)..."
NEW_VERSION=$(npm version "$BUMP_TYPE" --no-git-tag-version)
echo "✅ Version incremented to: $NEW_VERSION"

# 5. Packaging Dry-Run
echo ""
echo "📋 Step 5: Validating npm package pack artifact..."
npm pack --dry-run

echo ""
echo "========================================================================"
echo "🎉 Package $NEW_VERSION is compiled, verified, and ready for distribution!"
echo "To publish live to the npm registry:"
echo "   cd $MCP_DIR"
echo "   npm publish --access public"
echo "========================================================================"
