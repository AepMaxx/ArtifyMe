@echo off
echo ============================================================================
echo 🤖 ArtifyMe FastAPI (AI Service)
echo ============================================================================
echo.
echo Starting AI service...
echo URL: http://localhost:8000
echo Docs: http://localhost:8000/docs
echo.

cd fastapi
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
