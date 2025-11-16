# Wurm Manager

Aplicação desktop para gerenciamento de estoque no jogo Wurm Online. Construída com Go (backend) e React (frontend) usando Wails v2.

## Funcionalidades

- ✅ Gerenciamento de estoque de itens de bulk (Pedras, Tijolos, Lumps de Metais)
- ✅ Controle de qualidade e quantidade dos itens
- ✅ Visualização em tabela do estoque atual
- ✅ Gráficos de evolução do estoque ao longo do tempo
- ✅ Histórico de mudanças no estoque
- ✅ Persistência de dados com SQLite

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

### Build para desenvolvimento

```bash
wails build
```

### Build para produção (com otimizações)

```bash
wails build -clean
```

### Build para plataformas específicas

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
├── models.go              # Modelos de dados
├── stock_service.go       # Serviço de gerenciamento de estoque
├── stock_bindings.go      # Métodos expostos para o frontend
├── errors.go              # Definições de erros
├── go.mod                 # Dependências Go
├── wails.json             # Configuração do Wails
├── frontend/              # Frontend React
│   ├── src/
│   │   ├── App.jsx        # Componente principal
│   │   ├── api.js         # Wrapper da API
│   │   └── components/    # Componentes React
│   │       ├── StockForm.jsx
│   │       ├── StockTable.jsx
│   │       └── StockChart.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Uso

1. **Adicionar itens ao estoque:**
   - Selecione o tipo de item (Pedras, Tijolos ou Lumps de Metais)
   - Informe a qualidade (0-100)
   - Informe a quantidade
   - Clique em "Adicionar"

2. **Remover itens do estoque:**
   - Preencha os mesmos campos
   - Clique em "Remover"

3. **Visualizar estoque:**
   - A tabela mostra todos os itens com suas qualidades e quantidades
   - Os gráficos mostram a evolução do estoque ao longo do tempo

4. **Deletar item:**
   - Clique no ícone de lixeira na tabela para remover completamente um item

## Banco de Dados

A aplicação usa SQLite para persistência. O arquivo `wurm_stock.db` é criado automaticamente no diretório da aplicação.

## Tecnologias

- **Backend:** Go 1.21+
- **Frontend:** React 18, Vite
- **Gráficos:** Chart.js, react-chartjs-2
- **Banco de Dados:** SQLite (modernc.org/sqlite)
- **Framework Desktop:** Wails v2

## Licença

Este projeto é de uso pessoal para auxiliar jogadores do Wurm Online.

