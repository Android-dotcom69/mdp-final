@echo off
setlocal enabledelayedexpansion
title Face Recognition Service Cleanup by Antigravity

echo.
echo ==========================================================
echo Starting Cleanup of Installed Dependencies
echo ==========================================================

:: Log file
set LOGFILE=%~dp0cleanup.log
echo ========================================================== >> %LOGFILE%
echo Cleanup started - %DATE% %TIME% >> %LOGFILE%
echo ========================================================== >> %LOGFILE%

REM 1. Check and uninstall Python 3.11
echo [CHECK] Looking for Python 3.11...
where python >nul 2>&1
if %errorlevel%==0 (
    for /f "tokens=2 delims= " %%v in ('python --version') do set PYVER=%%v
    echo [INFO] Found Python version %PYVER%.
    echo [ACTION] Attempting to uninstall Python 3.11...
    winget uninstall -e --id Python.Python.3.11
    if %errorlevel% neq 0 (
        echo [WARNING] Could not uninstall Python via winget. Please remove manually. | tee -a %LOGFILE%
    ) else (
        echo [SUCCESS] Python 3.11 uninstalled.
    )
) else (
    echo [INFO] Python not found in PATH. Skipping.
)

REM 2. Check and uninstall Docker Desktop
echo [CHECK] Looking for Docker Desktop...
where docker >nul 2>&1
if %errorlevel%==0 (
    echo [INFO] Docker CLI found.
    echo [ACTION] Attempting to uninstall Docker Desktop...
    winget uninstall -e --id Docker.DockerDesktop
    if %errorlevel% neq 0 (
        echo [WARNING] Could not uninstall Docker via winget. Please remove manually. | tee -a %LOGFILE%
    ) else (
        echo [SUCCESS] Docker Desktop uninstalled.
    )
) else (
    echo [INFO] Docker not found in PATH. Skipping.
)

REM 3. Optional: Clean up leftover files
echo [STEP] Checking for leftover installer files...
if exist "%~dp0python-installer.msi" (
    del /f /q "%~dp0python-installer.msi"
    echo [INFO] Removed Python installer file.
)
if exist "%~dp0DockerDesktopInstaller.msi" (
    del /f /q "%~dp0DockerDesktopInstaller.msi"
    echo [INFO] Removed Docker installer file.
)

echo.
echo [SUCCESS] Cleanup complete.
echo [INFO] Review cleanup.log for details.
pause
endlocal