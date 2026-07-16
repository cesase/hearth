$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
Write-Host ""
Write-Host "  Hearth baslatiliyor..."
Write-Host ""

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  $fallback = "C:\Program Files\nodejs\node.exe"
  if (Test-Path $fallback) {
    $env:Path = "C:\Program Files\nodejs;" + $env:Path
  } else {
    Write-Host "Node.js bulunamadi. https://nodejs.org adresinden kur."
    Read-Host "Cikmak icin Enter"
    exit 1
  }
}

$electron = Join-Path $PSScriptRoot "node_modules\electron\dist\electron.exe"
if (-not (Test-Path $electron)) {
  Write-Host "Ilk kurulum yapiliyor..."
  npm install
  if (-not (Test-Path $electron)) {
    node (Join-Path $PSScriptRoot "node_modules\electron\install.js")
  }
}

if (-not (Test-Path $electron)) {
  Write-Host "Electron kurulamadi."
  Read-Host "Cikmak icin Enter"
  exit 1
}

Write-Host "Program aciliyor..."
& $electron .
