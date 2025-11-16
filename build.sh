#!/bin/bash

# Script de build para Wurm Manager
# Uso: ./build.sh [platform]
# Platform: windows, linux, darwin (padrão: todas)

set -e

PLATFORM=${1:-all}

echo "🚀 Iniciando build do Wurm Manager..."

# Verificar se Wails está instalado
if ! command -v wails &> /dev/null; then
    echo "❌ Wails CLI não encontrado. Instale com: go install github.com/wailsapp/wails/v2/cmd/wails@latest"
    exit 1
fi

# Instalar dependências do frontend
echo "📦 Instalando dependências do frontend..."
cd frontend
npm install
cd ..

# Build baseado na plataforma
if [ "$PLATFORM" = "all" ]; then
    echo "🔨 Building para todas as plataformas..."
    wails build -clean
elif [ "$PLATFORM" = "windows" ]; then
    echo "🔨 Building para Windows..."
    wails build -platform windows/amd64 -clean
elif [ "$PLATFORM" = "linux" ]; then
    echo "🔨 Building para Linux..."
    wails build -platform linux/amd64 -clean
elif [ "$PLATFORM" = "darwin" ] || [ "$PLATFORM" = "mac" ]; then
    echo "🔨 Building para macOS..."
    wails build -platform darwin/amd64 -clean
else
    echo "❌ Plataforma desconhecida: $PLATFORM"
    echo "Uso: ./build.sh [windows|linux|darwin|all]"
    exit 1
fi

echo "✅ Build concluído!"


