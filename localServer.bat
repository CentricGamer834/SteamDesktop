@echo off
echo U gotta have NodeJS ( nodejs.org/download ) and npm ( comes with node )
npm install -g http-server
cd /d "%~dp0"
echo Starting HTTP server on http://localhost:8000
npx http-server -p 8000
pause