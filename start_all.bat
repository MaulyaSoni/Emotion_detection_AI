@echo off
cd /d d:\Emotion-Detection
echo Starting Emotion Detection System...
echo.
echo [1] Starting Backend (ML Server) on port 8001...
start "Emotion Detection Backend" python scripts/ml_backend.py
echo [Backend PID started]
timeout /t 3
echo.
echo [2] Starting Frontend (Next.js) on port 8000...
start "Emotion Detection Frontend" npm run dev
echo [Frontend PID started]
echo.
echo ============================================
echo Services starting...
echo Frontend: http://localhost:8000
echo Backend: http://localhost:8001
echo API Docs: http://localhost:8001/docs
echo ============================================
echo.
timeout /t 2
