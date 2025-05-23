@echo off
setlocal enabledelayedexpansion

:: Get script directory (current folder)
set "rootDir=%~dp0"
:: Remove trailing backslash
if "%rootDir:~-1%"=="\" set "rootDir=%rootDir:~0,-1%"

:: Check if argument provided; if not, prompt user
if "%~1"=="" (
    set /p "ignoreDirs=Enter comma-separated directory names to ignore (optional): "
) else (
    set "ignoreDirs=%~1"
)

:: Convert ignoreDirs into tokens (space-separated)
:: Replace commas with spaces for easier parsing
set "ignoreDirs=%ignoreDirs:,= %"

echo Ignoring directories: %ignoreDirs%

:: Prepare exclusion list of absolute paths (only immediate subdirs)
set "excludeList="

for %%D in (%ignoreDirs%) do (
    if exist "%rootDir%\%%D" (
        set "excludeList=!excludeList!|%rootDir%\%%D"
    )
)

:: Recursive function to list files excluding specified dirs
call :listFiles "%rootDir%"
exit /b

:listFiles
set "currentDir=%~1"

:: Iterate folders inside currentDir
for /d %%F in ("%currentDir%\*") do (
    :: Check if folder is in excludeList
    set "skip=false"
    for %%X in ("!excludeList:|=" "!") do (
        if /i "%%~fF"=="%%~X" set "skip=true"
    )
    if "!skip!"=="false" (
        call :listFiles "%%~fF"
    )
)

:: List files in currentDir
for %%F in ("%currentDir%\*") do (
    if not "%%~aF"=="d" echo %%~fF
)
exit /b
