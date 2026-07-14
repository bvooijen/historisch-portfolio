@echo off
rem Dubbelklik dit bestand om de site lokaal te bekijken.
rem De browser opent vanzelf; sluit dit venster om de server te stoppen.
cd /d "%~dp0"
start "" http://localhost:5173/
call npm run dev
pause
