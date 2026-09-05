$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot
& node "$ScriptDir\test-cli-distribution.mjs"
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
