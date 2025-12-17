@echo off
echo Starting BizQuits...

echo Starting database...
docker-compose up -d

echo Waiting for SQL Server to be ready (30 seconds)...
timeout /t 30 /nobreak

echo Applying database migrations...
cd BizQuits
dotnet ef database update 2>nul

echo Starting backend...
start cmd /k "dotnet run"
cd ..

timeout /t 5 /nobreak

echo Starting frontend...
cd bizquits.frontend
call npm install --silent 2>nul
start cmd /k "npm run dev"
cd ..

timeout /t 3 /nobreak

echo.
echo ========================================
echo   BizQuits is running!
echo ========================================
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5204
echo   Swagger:  http://localhost:5204/swagger
echo ========================================
echo.
pause
