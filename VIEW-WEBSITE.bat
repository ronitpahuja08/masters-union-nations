@echo off
setlocal
cd /d "%~dp0"
title Masters Union Nations Preview

echo Updating latest motion-lab version...
git checkout motion-lab >nul 2>&1
git pull --ff-only origin motion-lab
if errorlevel 1 (
  echo.
  echo Could not update the preview. Check Git/GitHub access or local changes.
  pause
  exit /b 1
)

set "PORT_IN_USE="
for /f "tokens=5" %%A in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do set "PORT_IN_USE=1"

if not defined PORT_IN_USE (
  echo Starting local preview server...
  start "MUN Local Server" /min cmd /c "cd /d ""%~dp0"" && python -m http.server 5173"
  timeout /t 2 /nobreak >nul
)

start "" "http://localhost:5173/?preview=%RANDOM%%RANDOM%"
exit /b 0
