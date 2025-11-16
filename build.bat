@echo off
REM Script de build para Wurm Manager (Windows)
REM Uso: build.bat [platform]
REM Platform: windows, linux, darwin (padrão: todas)

setlocal enabledelayedexpansion

set PLATFORM=%1
if "%PLATFORM%"=="" set PLATFORM=all

echo 🚀 Iniciando build do Wurm Manager...

REM Verificar se Wails está instalado
where wails >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Wails CLI não encontrado. Instale com: go install github.com/wailsapp/wails/v2/cmd/wails@latest
    exit /b 1
)

REM Instalar dependências do frontend
echo 📦 Instalando dependências do frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências do frontend
    exit /b 1
)
cd ..

REM Build baseado na plataforma
if "%PLATFORM%"=="all" (
    echo 🔨 Building para todas as plataformas...
    wails build -clean
) else if "%PLATFORM%"=="windows" (
    echo 🔨 Building para Windows...
    wails build -platform windows/amd64 -clean
) else if "%PLATFORM%"=="linux" (
    echo 🔨 Building para Linux...
    wails build -platform linux/amd64 -clean
) else if "%PLATFORM%"=="darwin" (
    echo 🔨 Building para macOS...
    wails build -platform darwin/amd64 -clean
) else (
    echo ❌ Plataforma desconhecida: %PLATFORM%
    echo Uso: build.bat [windows^|linux^|darwin^|all]
    exit /b 1
)

if %errorlevel% equ 0 (
    echo ✅ Build concluído!
) else (
    echo ❌ Erro durante o build
    exit /b 1
)


