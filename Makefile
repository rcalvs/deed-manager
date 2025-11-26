.PHONY: help build build-all build-windows build-darwin build-linux release prepare-release update-version clean install-deps dev

# Variáveis
GITHUB_OWNER = rcalvs
GITHUB_REPO = deed-manager
RELEASE_DIR = release
BUILD_DIR = build/bin

# Detectar versão: primeiro tenta VERSION=, depois argumento posicional, depois lê do arquivo
ifdef VERSION
  # Versão passada como VERSION=x.x.x
else
  # Tenta pegar como argumento posicional (make build 0.2.2)
  VERSION := $(word 2,$(MAKECMDGOALS))
  ifeq ($(VERSION),)
    # Se não encontrou, lê do arquivo
    VERSION := $(shell grep -E '^const AppVersion =' main.go | sed -E 's/.*"([^"]+)".*/\1/')
  endif
endif

# Cores para output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Mostra esta mensagem de ajuda
	@echo "$(BLUE)Wurm Manager - Makefile$(NC)"
	@echo ""
	@echo "Uso: make [target] [VERSION=x.x.x]"
	@echo ""
	@echo "Targets disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "Exemplos:"
	@echo "  $(YELLOW)make build VERSION=0.2.2$(NC)   - Atualiza versão, faz build e prepara release"
	@echo "  $(YELLOW)make build-windows$(NC)        - Build apenas para Windows"
	@echo "  $(YELLOW)make build-all$(NC)            - Build para todas as plataformas"
	@echo "  $(YELLOW)make release VERSION=0.2.2$(NC) - Cria release completo (build + tag + GitHub)"
	@echo ""
	@echo "Nota: Para usar argumento posicional, use: $(YELLOW)make build 0.2.2$(NC)"
	@echo ""

update-version: ## Atualiza a versão no main.go (use: make update-version VERSION=x.x.x ou make update-version 0.2.2)
	@if [ -z "$(VERSION)" ] || [ "$(VERSION)" = "update-version" ]; then \
		echo "$(RED)Erro: VERSION não especificada. Use: make update-version VERSION=x.x.x ou make update-version 0.2.2$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Atualizando versão para $(VERSION)...$(NC)"
	@sed -i.bak "s/const AppVersion = \".*\"/const AppVersion = \"$(VERSION)\"/" main.go
	@rm -f main.go.bak
	@echo "$(GREEN)✓ Versão atualizada para $(VERSION)$(NC)"

install-deps: ## Instala dependências do frontend
	@echo "$(BLUE)Instalando dependências do frontend...$(NC)"
	@cd frontend && npm install
	@echo "$(GREEN)✓ Dependências instaladas$(NC)"

build-windows: ## Build para Windows
	@echo "$(BLUE)🔨 Building para Windows...$(NC)"
	@wails build -platform windows/amd64 -clean
	@echo "$(GREEN)✓ Build Windows concluído$(NC)"

build-darwin: ## Build para macOS (darwin)
	@echo "$(BLUE)🔨 Building para macOS...$(NC)"
	@wails build -platform darwin/amd64 -clean
	@echo "$(GREEN)✓ Build macOS concluído$(NC)"

build-linux: ## Build para Linux
	@echo "$(BLUE)🔨 Building para Linux...$(NC)"
	@wails build -platform linux/amd64 -clean
	@echo "$(GREEN)✓ Build Linux concluído$(NC)"

build-all: ## Build para todas as plataformas
	@echo "$(BLUE)🔨 Building para todas as plataformas...$(NC)"
	@$(MAKE) build-windows
	@$(MAKE) build-darwin
	@$(MAKE) build-linux
	@echo "$(GREEN)✓ Build para todas as plataformas concluído$(NC)"

prepare-release: ## Prepara binários para release (renomeia conforme convenção)
	@echo "$(BLUE)📦 Preparando binários para release...$(NC)"
	@mkdir -p $(RELEASE_DIR)
	@if [ -f "$(BUILD_DIR)/wurm-manager.exe" ]; then \
		cp "$(BUILD_DIR)/wurm-manager.exe" "$(RELEASE_DIR)/wurm-manager-windows-amd64.exe" && \
		echo "$(GREEN)✓ Windows binário preparado$(NC)"; \
	fi
	@if [ -f "$(BUILD_DIR)/wurm-manager" ]; then \
		if [[ "$$OSTYPE" == "darwin"* ]]; then \
			cp "$(BUILD_DIR)/wurm-manager" "$(RELEASE_DIR)/wurm-manager-darwin-amd64" && \
			chmod +x "$(RELEASE_DIR)/wurm-manager-darwin-amd64" && \
			echo "$(GREEN)✓ macOS binário preparado$(NC)"; \
		elif [[ "$$OSTYPE" == "linux"* ]]; then \
			cp "$(BUILD_DIR)/wurm-manager" "$(RELEASE_DIR)/wurm-manager-linux-amd64" && \
			chmod +x "$(RELEASE_DIR)/wurm-manager-linux-amd64" && \
			echo "$(GREEN)✓ Linux binário preparado$(NC)"; \
		fi \
	fi
	@echo "$(GREEN)✓ Binários preparados em $(RELEASE_DIR)/$(NC)"

build: update-version install-deps build-all prepare-release ## Atualiza versão, faz build e prepara release (use: make build VERSION=x.x.x ou make build 0.2.2)
	@echo ""
	@echo "$(GREEN)✅ Build completo concluído!$(NC)"
	@echo "$(YELLOW)Versão: $(VERSION)$(NC)"
	@echo "$(YELLOW)Binários prontos em: $(RELEASE_DIR)/$(NC)"
	@echo ""
	@echo "Próximos passos:"
	@echo "  1. Crie um release no GitHub com a tag v$(VERSION)"
	@echo "  2. Anexe os arquivos de $(RELEASE_DIR)/ ao release"
	@echo "  3. Ou use: $(YELLOW)make release VERSION=$(VERSION)$(NC) para criar automaticamente"

release: build ## Cria release completo (build + tag + GitHub release) (use: make release VERSION=x.x.x ou make release 0.2.2)
	@if [ -z "$(VERSION)" ] || [ "$(VERSION)" = "release" ]; then \
		echo "$(RED)Erro: VERSION não especificada. Use: make release VERSION=x.x.x ou make release 0.2.2$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)🚀 Criando release v$(VERSION)...$(NC)"
	@if command -v gh >/dev/null 2>&1; then \
		echo "$(BLUE)Criando tag e release no GitHub...$(NC)"; \
		git add main.go; \
		git commit -m "Release v$(VERSION): Atualizar versão" || true; \
		git tag -f "v$(VERSION)" -m "Release v$(VERSION)"; \
		gh release create "v$(VERSION)" $(RELEASE_DIR)/* \
			--title "Release v$(VERSION)" \
			--notes "Release v$(VERSION) do Wurm Manager" || \
		(echo "$(YELLOW)⚠ Não foi possível criar release no GitHub. Crie manualmente.$(NC)" && \
		 echo "   Tag criada: v$(VERSION)"); \
	else \
		echo "$(YELLOW)⚠ GitHub CLI não encontrado. Criando apenas tag...$(NC)"; \
		git add main.go; \
		git commit -m "Release v$(VERSION): Atualizar versão" || true; \
		git tag -f "v$(VERSION)" -m "Release v$(VERSION)"; \
		echo "$(YELLOW)⚠ Crie o release manualmente no GitHub:$(NC)"; \
		echo "   1. Vá em Releases → Draft a new release"; \
		echo "   2. Selecione a tag v$(VERSION)"; \
		echo "   3. Anexe os arquivos de $(RELEASE_DIR)/"; \
	fi
	@echo ""
	@echo "$(GREEN)✅ Release v$(VERSION) criado!$(NC)"

dev: ## Executa aplicação em modo desenvolvimento
	@echo "$(BLUE)🚀 Iniciando modo desenvolvimento...$(NC)"
	@wails dev

clean: ## Limpa arquivos de build e release
	@echo "$(BLUE)🧹 Limpando arquivos de build...$(NC)"
	@rm -rf $(BUILD_DIR)
	@rm -rf $(RELEASE_DIR)
	@rm -rf frontend/dist
	@echo "$(GREEN)✓ Limpeza concluída$(NC)"

test: ## Executa testes (se houver)
	@echo "$(BLUE)🧪 Executando testes...$(NC)"
	@go test ./... || echo "$(YELLOW)⚠ Nenhum teste encontrado$(NC)"

check-version: ## Verifica a versão atual
	@echo "$(BLUE)Versão atual: $(shell grep -E '^const AppVersion =' main.go | sed -E 's/.*"([^"]+)".*/\1/')$(NC)"

# Target dummy para capturar argumentos posicionais (ex: make build 0.2.2)
# Isso permite usar argumentos posicionais sem erro do Make
%:
	@:

