@echo off
cd /d "%~dp0"
if not exist "node_modules\electron\dist\electron.exe" (
  echo Ilk kurulum...
  call npm install
)
start "" "node_modules\electron\dist\electron.exe" .
exit