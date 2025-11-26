# Wurm Manager

Aplicação desktop para gerenciamento de estoque no jogo Wurm Online. Construída com Go (backend) e React (frontend) usando Wails v2.

## Funcionalidades

### Gerenciamento de Estoque
- ✅ Gerenciamento de estoque de múltiplas categorias de itens:
  - **Shards**: Stone, Slate, Marble, Sandstone
  - **Bricks**: Stone, Colossus, Slate, Marble, Sandstone, Pottery
  - **Construction**: Clay, Sand, Dirt, Mortar
  - **Metals**: Iron, Copper, Silver, Gold, Tin, Zinc, Lead, Empyrean, Steel, Brass, Bronze, Electrum, Glimmersteel, Adamantine, Seryll (15 tipos)
  - **Ores**: Iron, Copper, Silver, Gold, Tin, Zinc, Lead (7 tipos)
  - **Smithing**: Small Nail, Large Nail, Ribbon
  - **Wood**: 25 tipos de madeira × 7 tipos de item (Log, Plank, Wooden Beam, Shaft, Branch, Peg, Tenon) = 175 tipos
- ✅ Controle de qualidade (0-100) e quantidade dos itens
- ✅ Adição e remoção de itens do estoque
- ✅ Deleção de itens do estoque
- ✅ Conversão de Ores para Lumps correspondentes (mantendo qualidade)

### Interface e Visualização
- ✅ Visualização em tabela do estoque atual com badges de categoria
- ✅ Filtros por categoria (Shards, Bricks, Construction, Metals, Ores, Smithing, Wood)
- ✅ Busca por texto na tabela de estoque
- ✅ Busca por texto no formulário de cadastro (para facilitar seleção entre 220+ tipos)
- ✅ Gráficos de evolução do estoque ao longo do tempo (linha)
- ✅ Gráfico de estoque atual por tipo (barras)
- ✅ Sincronização de filtros entre tabela e gráficos
- ✅ Sistema de abas para organização de funcionalidades
- ✅ Histórico de mudanças no estoque com quantidades acumuladas

### Atualizações Automáticas
- ✅ Sistema de auto-update integrado
  - Verificação automática de novas versões via GitHub Releases
  - Suporte para Windows e macOS usando Squirrel
  - Interface de usuário para verificar e instalar atualizações
  - Download e instalação automática de novas versões

### Ferramentas de Desenvolvimento
- ✅ Modo desenvolvedor com:
  - Campo de data customizada para testes de gráficos
  - Botão para limpar banco de dados

### Persistência
- ✅ Persistência de dados com SQLite
- ✅ Histórico completo de alterações com timestamps

## Requisitos

- Go 1.21 ou superior
- Node.js 18 ou superior
- npm ou yarn
- Wails CLI v2

## Instalação

### 1. Instalar Wails CLI

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

### 2. Instalar dependências do backend

```bash
go mod tidy
```

### 3. Instalar dependências do frontend

```bash
cd frontend
npm install
cd ..
```

## Desenvolvimento

### Executar em modo de desenvolvimento

```bash
wails dev
```

Isso irá:
- Compilar o backend Go
- Iniciar o servidor de desenvolvimento do frontend
- Abrir a aplicação com hot-reload

## Build

### Usando Makefile (Recomendado)

O projeto inclui um Makefile que simplifica o processo de build e release:

```bash
# Ver ajuda completa
make help

# Build completo (atualiza versão + build + prepara release)
make build VERSION=0.2.2
# ou usando argumento posicional
make build 0.2.2

# Build para plataforma específica
make build-windows    # Windows
make build-darwin     # macOS
make build-linux      # Linux
make build-all        # Todas as plataformas

# Criar release completo (build + tag + GitHub)
make release VERSION=0.2.2
# ou
make release 0.2.2

# Outros comandos úteis
make dev              # Modo desenvolvimento
make clean            # Limpa arquivos de build
make check-version     # Verifica versão atual
```

Para mais detalhes, consulte [.makefile-help.md](./.makefile-help.md).

### Build Manual

#### Build para desenvolvimento

```bash
wails build
```

#### Build para produção (com otimizações)

```bash
wails build -clean
```

#### Build para plataformas específicas

```bash
# Windows
wails build -platform windows/amd64

# Linux
wails build -platform linux/amd64

# macOS
wails build -platform darwin/amd64
```

## Estrutura do Projeto

```
wurm-manager/
├── main.go                 # Ponto de entrada da aplicação
├── app.go                  # Estrutura principal da aplicação
├── models.go              # Modelos de dados e tipos de itens
├── stock_service.go       # Serviço de gerenciamento de estoque
├── stock_bindings.go      # Métodos expostos para o frontend
├── errors.go              # Definições de erros
├── go.mod                 # Dependências Go
├── wails.json             # Configuração do Wails
├── frontend/              # Frontend React
│   ├── src/
│   │   ├── App.jsx        # Componente principal com sistema de abas
│   │   ├── api.js         # Wrapper da API
│   │   ├── constants.js   # Constantes (tipos de itens, categorias, cores)
│   │   └── components/    # Componentes React
│   │       ├── StockForm.jsx      # Formulário de adicionar/remover
│   │       ├── StockTable.jsx     # Tabela de estoque com filtros
│   │       ├── StockChart.jsx     # Gráficos de evolução
│   │       ├── StockTab.jsx       # Aba de estoque
│   │       ├── Settings.jsx       # Configurações e modo desenvolvedor
│   │       ├── Tabs.jsx           # Componente de abas
│   │       └── ConvertModal.jsx   # Modal de conversão Ore->Lump
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Uso

### Adicionar Itens ao Estoque

1. Use o campo de busca para filtrar os 220+ tipos de itens disponíveis
2. Selecione o tipo de item desejado no dropdown
3. Informe a qualidade (0-100)
4. Informe a quantidade
5. (Opcional) Ative o Modo Desenvolvedor para definir uma data customizada
6. Clique em "Adicionar"

### Remover Itens do Estoque

1. Selecione o tipo de item
2. Informe a qualidade e quantidade a ser removida
3. Clique em "Remover"

### Gerenciar Estoque

- **Deletar item:** Clique no ícone de lixeira na tabela para remover completamente um item
- **Converter Ores em Lumps:** Clique no botão de conversão ao lado dos itens de Ore para convertê-los automaticamente
- **Filtrar por categoria:** Use o dropdown de categorias para filtrar itens na tabela e gráficos
- **Buscar por texto:** Digite no campo de busca para encontrar itens por nome
- **Visualizar evolução:** Os gráficos mostram a evolução acumulada do estoque ao longo do tempo

### Modo Desenvolvedor

1. Acesse as configurações no canto superior direito
2. Ative o "Modo Desenvolvedor"
3. Com o modo ativo, você terá acesso a:
   - Campo de data customizada no formulário (para testar gráficos)
   - Botão "Limpar Banco" para resetar todos os dados

### Atualizações Automáticas

1. Acesse as configurações no canto superior direito
2. Role até a seção "Atualizações"
3. Clique em "Verificar Atualizações"
4. Se houver uma nova versão disponível, clique em "Instalar Atualização"
5. A aplicação será reiniciada automaticamente após a atualização

**Nota:** O sistema de auto-update funciona apenas no Windows e macOS. Para mais detalhes, consulte [AUTO_UPDATE_SETUP.md](./AUTO_UPDATE_SETUP.md).

## Banco de Dados

A aplicação usa SQLite para persistência. O arquivo `wurm_stock.db` é criado automaticamente no diretório da aplicação.

## Tecnologias

- **Backend:** Go 1.21+
- **Frontend:** React 18, Vite
- **Gráficos:** Chart.js, react-chartjs-2
- **Ícones:** React Icons (Font Awesome)
- **Banco de Dados:** SQLite (modernc.org/sqlite)
- **Framework Desktop:** Wails v2

## Categorias de Itens

O sistema suporta **7 categorias principais** com mais de **220 tipos de itens**:

- **Shards** (4 tipos): Fragmentos de pedras
- **Bricks** (6 tipos): Tijolos de diferentes materiais
- **Construction** (4 tipos): Materiais de construção básicos
- **Metals** (15 tipos): Lumps de metais variados
- **Ores** (7 tipos): Minérios que podem ser convertidos em Lumps
- **Smithing** (3 tipos): Itens de ferraria
- **Wood** (175 tipos): 25 tipos de madeira × 7 tipos de item (Log, Plank, Wooden Beam, Shaft, Branch, Peg, Tenon)

## Licença

Este projeto é de uso pessoal para auxiliar jogadores do Wurm Online.

