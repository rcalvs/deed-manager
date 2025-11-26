#!/bin/bash

# Script para preparar binários para release no GitHub
# Este script renomeia os binários para seguir a convenção do Squirrel
# Uso: ./prepare-release.sh [version]
# Exemplo: ./prepare-release.sh 0.2.1

set -e

VERSION=${1:-"0.2.1"}
RELEASE_DIR="release"

echo "📦 Preparando binários para release v${VERSION}..."

# Criar diretório de release
mkdir -p "${RELEASE_DIR}"

# Função para copiar e renomear binário
prepare_binary() {
    local platform=$1
    local arch=$2
    local source=$3
    local dest=$4
    
    if [ -f "$source" ]; then
        echo "  ✓ Preparando ${platform}/${arch}..."
        cp "$source" "${RELEASE_DIR}/${dest}"
        chmod +x "${RELEASE_DIR}/${dest}"
    else
        echo "  ⚠ Binário não encontrado: $source"
    fi
}

# Windows
if [ -f "build/bin/wurm-manager.exe" ]; then
    prepare_binary "windows" "amd64" "build/bin/wurm-manager.exe" "wurm-manager-windows-amd64.exe"
fi

# macOS
if [ -f "build/bin/wurm-manager" ]; then
    # Verificar se é macOS (darwin)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        prepare_binary "darwin" "amd64" "build/bin/wurm-manager" "wurm-manager-darwin-amd64"
        # Verificar se há build para arm64
        if [ -f "build/bin/wurm-manager-arm64" ]; then
            prepare_binary "darwin" "arm64" "build/bin/wurm-manager-arm64" "wurm-manager-darwin-arm64"
        fi
    fi
fi

# Linux
if [ -f "build/bin/wurm-manager" ] && [[ "$OSTYPE" == "linux"* ]]; then
    prepare_binary "linux" "amd64" "build/bin/wurm-manager" "wurm-manager-linux-amd64"
fi

echo ""
echo "✅ Binários preparados em: ${RELEASE_DIR}/"
echo ""
echo "📋 Próximos passos:"
echo "1. Crie um release no GitHub com a tag v${VERSION}"
echo "2. Anexe os arquivos de ${RELEASE_DIR}/ ao release"
echo "3. Publique o release"
echo ""
echo "💡 Dica: Use 'gh release create v${VERSION} ${RELEASE_DIR}/* -t \"Release v${VERSION}\"' se tiver GitHub CLI instalado"

