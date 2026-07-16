@echo off
cd /d "%~dp0"
REM Paketli Hearth.exe varsa onu ac (gorev cubugu ikonu dogru)
if exist "dist\win-unpacked\Hearth.exe" (
  start "" "dist\win-unpacked\Hearth.exe"
  exit /b 0
)
if not exist "node_modules\electron\dist\electron.exe" (
  echo Ilk kurulum...
  call npm install
)
start "" "node_modules\electron\dist\electron.exe" .
exit /b 0
