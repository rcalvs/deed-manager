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
  - **Farm**: 28 tipos (vegetais, grãos, cogumelos)
  - **Garden**: 18 tipos (ervas, especiarias, plantas especiais)
  - **Animal**: 44 tipos (carnes, partes de animais, recursos especiais)
  - **Fruits**: 16 tipos (frutas e nozes)
- ✅ Controle de qualidade (0-100) e quantidade dos itens
- ✅ Adição e remoção de itens do estoque
- ✅ Deleção de itens do estoque
- ✅ Conversão de Ores para Lumps correspondentes (mantendo qualidade)
- ✅ Conversão de Wood: Logs → Planks (1:6), Logs → Shafts (1:12), Shafts → Pegs (1:10)
- ✅ QL padrão configurável com modal de configuração

### Interface e Visualização
- ✅ Visualização em tabela do estoque atual com badges de categoria
- ✅ Filtros por categoria (11 categorias disponíveis)
- ✅ Busca por texto na tabela de estoque
- ✅ Busca por texto no formulário de cadastro (para facilitar seleção entre 330+ tipos)
- ✅ Gráficos de evolução do estoque ao longo do tempo (linha)
- ✅ Gráfico de estoque atual por tipo (barras)
- ✅ Gráfico de estoque atual por categoria (barras)
- ✅ Sincronização de filtros entre tabela e gráficos
- ✅ Sistema de abas para organização de funcionalidades
- ✅ Histórico de mudanças no estoque com quantidades acumuladas
- ✅ Tela inicial de boas-vindas com tour de funcionalidades
- ✅ Sistema de tradução (Português, Inglês, Russo)
- ✅ Modo expandido para tabela de estoque (tela cheia)

### Sistema de Notas e Localizações
- ✅ Gerenciamento de notas (to-do list)
  - Criar, editar, deletar e marcar como concluída
  - Datas de início e fim opcionais
  - Categorização opcional (mesmas categorias do estoque)
  - Busca por texto e filtro por categoria
  - Badges de categoria nos cards
- ✅ Gerenciamento de localizações do mapa
  - Salvar coordenadas X, Y do jogo
  - Suporte para Yaga.host e WurmMaps.xyz
  - Seleção de servidor (Harmony, Cadence, Melody)
  - Parsing automático de URLs de mapa
  - Categorização opcional
  - Busca por texto e filtro por categoria
  - Badges de categoria nos cards
  - Link direto para abrir no mapa

### Atualizações Automáticas
- ✅ Sistema de auto-update integrado
  - Verificação automática de novas versões via GitHub Releases
  - Suporte para Windows e macOS usando Squirrel
  - Interface de usuário para verificar e instalar atualizações
  - Download e instalação automática de novas versões
  - Modal com release notes para visualização completa

### Internacionalização (i18n)
- ✅ Suporte a múltiplos idiomas:
  - Português (pt)
  - Inglês (en) - padrão
  - Russo (ru)
- ✅ Seletor de idioma na tela inicial e nas configurações
- ✅ Detecção automática do idioma do sistema
- ✅ Persistência da escolha de idioma

### Ferramentas de Desenvolvimento
- ✅ Modo desenvolvedor com:
  - Campo de data customizada para testes de gráficos
  - Botão para limpar banco de dados

### Persistência
- ✅ Persistência de dados com SQLite
- ✅ Histórico completo de alterações com timestamps
- ✅ Armazenamento de preferências (idioma, nome do Deed, QL padrão)

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
├── notes_service.go       # Serviço de gerenciamento de notas e localizações
├── notes_bindings.go      # Métodos expostos para notas/localizações
├── update_service.go      # Serviço de atualizações automáticas
├── update_bindings.go     # Métodos expostos para atualizações
├── errors.go              # Definições de erros
├── go.mod                 # Dependências Go
├── wails.json             # Configuração do Wails
├── frontend/              # Frontend React
│   ├── src/
│   │   ├── App.jsx        # Componente principal com sistema de abas
│   │   ├── api.js         # Wrapper da API
│   │   ├── constants.js   # Constantes (tipos de itens, categorias, cores)
│   │   ├── api.js         # Wrapper da API
│   │   ├── i18n/          # Sistema de tradução
│   │   │   ├── config.js   # Configuração do i18next
│   │   │   └── locales/    # Arquivos de tradução (en.json, pt.json, ru.json)
│   │   └── components/    # Componentes React
│   │       ├── StockForm.jsx      # Formulário de adicionar/remover
│   │       ├── StockTable.jsx     # Tabela de estoque com filtros
│   │       ├── StockChart.jsx     # Gráficos de evolução
│   │       ├── StockTab.jsx       # Aba de estoque
│   │       ├── NotesTab.jsx       # Aba de notas e localizações
│   │       ├── NotesSection.jsx   # Seção de notas (to-do list)
│   │       ├── LocationsSection.jsx # Seção de localizações do mapa
│   │       ├── Settings.jsx       # Configurações e modo desenvolvedor
│   │       ├── UpdateChecker.jsx # Verificador de atualizações
│   │       ├── WelcomeScreen.jsx  # Tela inicial de boas-vindas
│   │       ├── LanguageSelector.jsx # Seletor de idioma
│   │       ├── QualityModal.jsx  # Modal de configuração de QL padrão
│   │       ├── Tabs.jsx           # Componente de abas
│   │       └── ConvertModal.jsx   # Modal de conversão Ore->Lump / Wood
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
- **Converter Wood:** Converta Logs em Planks (1:6), Logs em Shafts (1:12) ou Shafts em Pegs (1:10)
- **Filtrar por categoria:** Use o dropdown de categorias para filtrar itens na tabela e gráficos
- **Buscar por texto:** Digite no campo de busca para encontrar itens por nome
- **Visualizar evolução:** Os gráficos mostram a evolução acumulada do estoque ao longo do tempo
- **Expandir tabela:** Use o botão de expandir para visualizar a tabela em tela cheia
- **QL padrão:** Configure um QL padrão que será usado automaticamente ao adicionar itens

### Gerenciar Notas

- **Criar nota:** Clique em "Nova Nota" e preencha título, descrição (opcional), datas (opcionais) e categoria (opcional)
- **Editar nota:** Clique no ícone de editar para modificar uma nota existente
- **Marcar como concluída:** Clique no ícone de check para marcar/desmarcar como concluída
- **Deletar nota:** Clique no ícone de lixeira para remover uma nota
- **Filtrar e buscar:** Use os filtros de busca e categoria para encontrar notas rapidamente

### Gerenciar Localizações

- **Criar localização:** Clique em "Novo Local" e preencha as informações
- **URL automática:** Cole uma URL do mapa (Yaga.host ou WurmMaps.xyz) para preencher automaticamente os campos
- **Abrir no mapa:** Clique no ícone de link externo para abrir a localização no navegador
- **Editar/Deletar:** Use os ícones de editar e deletar para gerenciar localizações
- **Filtrar e buscar:** Use os filtros de busca e categoria para encontrar localizações rapidamente

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
4. Se houver uma nova versão disponível, um modal será exibido com os release notes
5. Revise as novidades e clique em "Instalar Atualização" ou feche o modal para instalar depois
6. A aplicação será reiniciada automaticamente após a atualização

### Configurações e Personalização

- **Idioma:** Selecione o idioma da interface na tela inicial ou nas configurações
- **Nome do Deed:** Configure o nome do seu Deed na tela inicial (opcional)
- **QL Padrão:** Configure um QL padrão que será usado ao adicionar itens (acessível pelo botão de editar ao lado do campo QL)

## Banco de Dados

A aplicação usa SQLite para persistência. O arquivo `wurm_stock.db` é criado automaticamente no diretório da aplicação.

## Tecnologias

- **Backend:** Go 1.21+
- **Frontend:** React 18, Vite
- **Gráficos:** Chart.js, react-chartjs-2
- **Ícones:** React Icons (Font Awesome)
- **Internacionalização:** i18next, react-i18next
- **Banco de Dados:** SQLite (modernc.org/sqlite)
- **Framework Desktop:** Wails v2
- **Auto-update:** go-github-selfupdate

## Categorias de Itens

O sistema suporta **11 categorias** com mais de **330 tipos de itens**:

- **Shards** (4 tipos): Fragmentos de pedras
- **Bricks** (6 tipos): Tijolos de diferentes materiais
- **Construction** (4 tipos): Materiais de construção básicos
- **Metals** (15 tipos): Lumps de metais variados
- **Ores** (7 tipos): Minérios que podem ser convertidos em Lumps
- **Smithing** (3 tipos): Itens de ferraria
- **Wood** (175 tipos): 25 tipos de madeira × 7 tipos de item (Log, Plank, Wooden Beam, Shaft, Branch, Peg, Tenon)
- **Farm** (28 tipos): Vegetais, grãos, cogumelos e outros produtos agrícolas
- **Garden** (18 tipos): Ervas, especiarias e plantas especiais
- **Animal** (44 tipos): Carnes, partes de animais e recursos especiais
- **Fruits** (16 tipos): Frutas e nozes

## Licença

Este projeto é de uso pessoal para auxiliar jogadores do Wurm Online.

