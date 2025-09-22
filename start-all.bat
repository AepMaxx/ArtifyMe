@echo off
echo ============================================================================
echo 🎨 ArtifyMe - Complete Project Startup Script
echo ============================================================================
echo.
echo This script will start all three services:
echo - Backend (.NET Core) on http://localhost:5000
echo - FastAPI (AI Service) on http://localhost:8000  
echo - Frontend (React) on http://localhost:3000
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

echo.
echo 🚀 Starting ArtifyMe services...
echo.

REM Start Backend
echo 📊 Starting Backend (.NET Core)...
start "ArtifyMe Backend" cmd /k "cd backend && dotnet run"
timeout /t 3 /nobreak >nul

REM Start FastAPI
echo 🤖 Starting FastAPI (AI Service)...
start "ArtifyMe FastAPI" cmd /k "cd fastapi && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 3 /nobreak >nul

REM Start Frontend
echo 🎨 Starting Frontend (React)...
start "ArtifyMe Frontend" cmd /k "cd frontend && npm start"
timeout /t 3 /nobreak >nul

echo.
echo ✅ All services started!
echo.
echo 📱 Frontend: http://localhost:3000
echo 📊 Backend API: http://localhost:5000/swagger
echo 🤖 AI Service: http://localhost:8000/docs
echo.
echo Press any key to exit...
pause >nul