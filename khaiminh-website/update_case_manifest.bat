@echo off
setlocal
cd /d "%~dp0"
python rebuild_case_manifest.py
echo.
echo Done. Press any key to close.
pause >nul
