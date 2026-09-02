@echo off
echo =========================================================
echo  Starting WeatherGPT Platform (Python FastAPI + React)
echo =========================================================

REM Start Python FastAPI Backend in a new window
start "WeatherGPT Backend" cmd /k "cd backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

REM Start Vite Frontend in a new window
start "WeatherGPT Frontend" cmd /k "npm run dev"

echo.
echo Both servers started!
echo Frontend: http://localhost:5173
echo Backend API: http://127.0.0.1:8000
echo API Docs: http://127.0.0.1:8000/docs
echo =========================================================
