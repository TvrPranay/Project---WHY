@echo off
echo ===================================================
echo Running WHY Backend Pytest Test Suite
echo ===================================================
cd /d "%~dp0\..\backend"
call .venv\Scripts\activate.bat
python -m pytest tests/ -v
