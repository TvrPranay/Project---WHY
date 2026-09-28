@echo off
echo ===================================================
echo Starting WHY FastAPI Backend on http://127.0.0.1:8000
echo ===================================================
cd /d "%~dp0\..\backend"
call .venv\Scripts\activate.bat
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
