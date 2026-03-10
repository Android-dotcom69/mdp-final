@echo off
setlocal enabledelayedexpansion
title Face Recognition Service Installer by Antigravity

:: Log setup
set LOGFILE=%~dp0setup.log
echo ========================================================== >> %LOGFILE%
echo Starting Face Recognition Service Setup - %DATE% %TIME% >> %LOGFILE%
echo ========================================================== >> %LOGFILE%

echo.
echo ==========================================================
echo Starting Face Recognition Service Setup
echo ==========================================================

REM 1. Check for Winget
echo [CHECK] Checking for winget...
where winget >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Winget is not installed. Please update Windows 10/11 or install App Installer from Microsoft Store. | tee -a %LOGFILE%
    pause
    exit /b
)
echo [OK] Winget found.

REM 2. Check for Python
echo [CHECK] Checking for Python...
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Python not found. Launching interactive installer...
    if not exist "%~dp0python-installer.msi" (
        echo [INFO] Downloading Python 3.11 MSI...
        curl -L -o "%~dp0python-installer.msi" https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe
    )
    msiexec /i "%~dp0python-installer.msi"
    echo [INFO] Please restart this script after installation to pick up PATH changes.
    pause
    exit /b
) else (
    for /f "tokens=2 delims= " %%v in ('python --version') do set PYVER=%%v
    echo [OK] Python version %PYVER% found.
)

REM 3. Check for Docker Desktop
echo [CHECK] Checking for Docker Desktop...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Docker daemon is not running.

    REM Search PATH for docker.exe
    for %%i in (docker.exe) do (
        if not "%%~$PATH:i"=="" (
            echo [INFO] Docker CLI found in PATH at: %%~$PATH:i
            goto :startDocker
        )
    )

    REM Check default install location
    if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
        echo [INFO] Docker Desktop found in default location.
        goto :startDocker
    )

    REM Check registry for custom install path
    for /f "tokens=2*" %%a in ('reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\Docker Desktop.exe" /ve 2^>nul') do (
        set DOCKERPATH=%%b
    )
    if defined DOCKERPATH (
        echo [INFO] Docker Desktop found via registry at: %DOCKERPATH%
        goto :startDocker
    )

    echo [WARNING] Docker not found. Launching interactive installer...
    if not exist "%~dp0DockerDesktopInstaller.msi" (
        echo [INFO] Downloading Docker Desktop MSI...
        curl -L -o "%~dp0DockerDesktopInstaller.msi" https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.msi
    )
    msiexec /i "%~dp0DockerDesktopInstaller.msi"
    echo [IMPORTANT] Docker Desktop requires a system restart/logout to function.
    pause
    exit /b
) else (
    echo [OK] Docker is running.
)

:startDocker
echo [INFO] Attempting to start Docker Desktop...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
echo [WAIT] Waiting for Docker to start (this may take a minute)...
timeout /t 60
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker daemon still not running after wait.
    pause
    exit /b
) else (
    echo [SUCCESS] Docker daemon is running.
)

REM 4. Start Database (PostgreSQL)
echo.
echo [STEP] Ensuring Database is Up...
docker-compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start database. Is Docker running?
    pause
    exit /b
)

REM 5. Install Python Requirements
echo.
echo [STEP] Installing Python Requirements...
pip install --upgrade pip setuptools wheel
if not exist "\.venv" (
    E:\Anaconda\python.exe -m venv .venv
)
call .venv\Scripts\activate.bat
python --version
pip --version
pip install -r requirements.txt --use-pep517
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install requirements.
    echo [INFO] This is often due to missing C++ Build Tools for 'dlib'.
    echo [INFO] Try installing "Desktop development with C++" from Visual Studio Installer.
    pause
    exit /b
)

REM 6. Run the Application
echo.
echo [SUCCESS] Setup Complete.
echo [INFO] API Documentation: http://localhost:8000/docs
echo [INFO] Dashboard: http://localhost:8000/static/index.html
echo.
echo Starting Server...
start http://localhost:8000/docs
start http://localhost:8000/static/index.html
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
endlocal