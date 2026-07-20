# Compile assets/bin/wasapi-loopback.exe (Windows .NET Framework 4.x csc)
$ErrorActionPreference = "Stop"
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
if (-not (Test-Path (Join-Path $PSScriptRoot "..\tools\wasapi-loopback\WasapiLoopback.cs"))) {
  $root = Resolve-Path (Join-Path $PSScriptRoot "..")
} else {
  $root = Resolve-Path (Join-Path $PSScriptRoot "..")
}
$src = Join-Path $root "tools\wasapi-loopback\WasapiLoopback.cs"
$outDir = Join-Path $root "assets\bin"
$out = Join-Path $outDir "wasapi-loopback.exe"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$csc = Join-Path $env:WINDIR "Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if (-not (Test-Path $csc)) {
  $csc = Join-Path $env:WINDIR "Microsoft.NET\Framework\v4.0.30319\csc.exe"
}
if (-not (Test-Path $csc)) { throw "csc.exe not found (need .NET Framework 4.x)" }
& $csc /nologo /optimize+ /target:exe /out:$out $src
if ($LASTEXITCODE -ne 0) { throw "csc failed" }
Write-Host "OK $out ($((Get-Item $out).Length) bytes)"
