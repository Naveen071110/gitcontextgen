param (
    [string]$BumpType = "patch"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$McpDir = Join-Path $RepoRoot "mcp-server"

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "[RELEASE] Starting GitContextGen MCP Server Packaging Pipeline" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan

# 1. Run Verification Suite
Write-Host "`nStep 1: Running Automated MCP Stdio Verification Suite..." -ForegroundColor Yellow
& node "$RepoRoot\scripts\verify-mcp.mjs"
if ($LASTEXITCODE -ne 0) {
    Write-Error "MCP verification failed. Release aborted."
    exit 1
}

# 2. Build MCP Server Distribution
Write-Host "`nStep 2: Compiling TypeScript into dist/..." -ForegroundColor Yellow
Push-Location $McpDir
try {
    & npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "TypeScript compilation failed."
        exit 1
    }

    # 3. Ensure Executable Hashbang
    Write-Host "`nStep 3: Enforcing Executable Hashbang..." -ForegroundColor Yellow
    $IndexFile = Join-Path $McpDir "dist\index.js"
    if (-not (Test-Path $IndexFile)) {
        Write-Error "dist\index.js not found after build."
        exit 1
    }

    $Content = [System.IO.File]::ReadAllText($IndexFile)
    if (-not $Content.StartsWith("#!/usr/bin/env node")) {
        Write-Host "Injecting #!/usr/bin/env node hashbang..." -ForegroundColor Cyan
        [System.IO.File]::WriteAllText($IndexFile, "#!/usr/bin/env node`n" + $Content)
    }
    Write-Host "SUCCESS: dist\index.js hashbang verified." -ForegroundColor Green

    # 4. Version Increment
    Write-Host "`nStep 4: Incrementing package version ($BumpType)..." -ForegroundColor Yellow
    $NewVersion = & npm version $BumpType --no-git-tag-version
    Write-Host "SUCCESS: Version incremented to: $NewVersion" -ForegroundColor Green

    # 5. Pack Dry-Run
    Write-Host "`nStep 5: Validating npm package pack artifact..." -ForegroundColor Yellow
    & npm pack --dry-run

    Write-Host "`n========================================================================" -ForegroundColor Cyan
    Write-Host "SUCCESS: Package $NewVersion is compiled and verified." -ForegroundColor Green
    Write-Host "To publish live to npm registry:"
    Write-Host "   cd $McpDir"
    Write-Host "   npm publish --access public"
    Write-Host "========================================================================" -ForegroundColor Cyan
}
finally {
    Pop-Location
}
