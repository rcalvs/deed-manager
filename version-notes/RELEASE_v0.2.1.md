# Release v0.2.1 - Sistema de Notas e Localizações

## 🎉 Novidades Principais

### ✨ Nova Aba "Notas"
Implementação completa de um sistema de organização pessoal com duas seções principais:

#### 📝 Seção Notas (To-Do List)
Sistema completo de gerenciamento de tarefas:
- **Criação de notas**: Título, descrição, data de início e data de término opcional
- **Edição e exclusão**: Gerenciamento completo das notas criadas
- **Marcação de conclusão**: Toggle para marcar tarefas como concluídas
- **Visualização organizada**: Lista com badges de datas e status de conclusão
- **Filtros visuais**: Notas concluídas aparecem com estilo diferenciado (opacidade reduzida e texto riscado)

#### 🗺️ Seção Locais (Map Locations)
Sistema de salvamento de localizações do mapa do jogo:
- **Cadastro de locais**: Nome, descrição e coordenadas X, Y
- **Suporte a múltiplos mapas**: Yaga.host e WurmMaps.xyz
- **Suporte a múltiplos servidores**: Harmony, Cadence, Melody
- **Parsing automático de URLs**: Preenchimento automático de campos a partir de URLs
- **Links diretos**: Botão para abrir localização diretamente no mapa
- **Badges informativos**: Exibição visual do tipo de mapa e servidor

### 🔗 Parsing Inteligente de URLs
Funcionalidade avançada para facilitar o cadastro de localizações:
- **Suporte a Yaga.host**: URLs no formato `https://harmony.yaga.host/#2296,1726`
  - Extração automática do servidor do subdomínio
  - Extração de coordenadas do hash (#)
- **Suporte a WurmMaps.xyz**: URLs no formato `https://wurmmaps.xyz/Harmony/?x=2660&y=3211`
  - Extração do servidor do pathname
  - Extração de coordenadas dos query parameters
- **Preenchimento automático**: Ao colar uma URL, todos os campos são preenchidos automaticamente
- **Validação**: Suporte para URLs com ou sem protocolo (http/https)

### 🎨 Novo Tema em Tons de Cinza
Redesign completo da paleta de cores:
- **Background principal**: Alterado de azul escuro (#1b2636) para cinza escuro (#1e1e1e)
- **Cards e containers**: Tons de cinza (#2d2d2d, #3a3a3a) para melhor contraste
- **Bordas e elementos**: Cinza médio (#4a4a4a, #5a5a5a) para hierarquia visual
- **Acentos mantidos**: Botões e elementos interativos mantêm o azul (#5a9fd4) para destaque
- **Consistência visual**: Todos os componentes atualizados para a nova paleta

### 🐛 Correções e Melhorias

#### Correções de Layout
- **Overflow em formulários**: Corrigido problema de formulários extrapolando a altura da tela
- **Acessibilidade de botões**: Botões de ação agora sempre acessíveis com scroll adequado
- **Scroll otimizado**: Melhorias no comportamento de scroll em containers flex

#### Melhorias de UX
- **Formulários responsivos**: Layout adaptável que funciona em diferentes tamanhos de tela
- **Feedback visual**: Melhorias nos estados de hover e interação
- **Organização**: Separação clara entre seções de Notas e Locais

## 📦 Novos Componentes

### Backend (Go)
- **`NotesService`**: Serviço completo para gerenciamento de notas e localizações
- **`Note` model**: Estrutura de dados para notas/tarefas
- **`Location` model**: Estrutura de dados para localizações do mapa
- **Tabelas SQL**: `notes` e `locations` com suporte a campos opcionais
- **Bindings Wails**: Métodos expostos para o frontend:
  - `AddNote`, `GetNote`, `GetAllNotes`, `UpdateNote`, `DeleteNote`, `ToggleNoteCompleted`
  - `CreateLocation`, `GetLocation`, `GetAllLocations`, `UpdateLocation`, `DeleteLocation`

### Frontend (React)
- **`NotesTab`**: Componente principal da aba de notas
- **`NotesSection`**: Seção de gerenciamento de notas/to-do list
- **`LocationsSection`**: Seção de gerenciamento de localizações
- **API integration**: Funções JavaScript para comunicação com backend

## 🔧 Melhorias Técnicas

### Backend
- **Migração de banco de dados**: Sistema idempotente que adiciona colunas apenas se não existirem
- **Campos opcionais**: Uso de `sql.NullString` para datas opcionais
- **Validação de dados**: Tratamento adequado de valores NULL e opcionais

### Frontend
- **Estado gerenciado**: Uso de `useState` e `useEffect` para gerenciamento de estado
- **Parsing de URLs**: Lógica robusta para extrair informações de diferentes formatos de URL
- **Validação de formulários**: Validação client-side antes de enviar dados
- **Feedback ao usuário**: Mensagens de erro e confirmações adequadas

## 📝 Estrutura de Dados

### Note (Nota/Tarefa)
```json
{
  "id": 1,
  "title": "Título da nota",
  "description": "Descrição detalhada",
  "startDate": "2024-01-15T00:00:00Z",
  "endDate": "2024-01-20T00:00:00Z",
  "completed": false,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

### Location (Localização)
```json
{
  "id": 1,
  "name": "Nome do local",
  "description": "Descrição do local",
  "mapType": "yaga",
  "server": "Harmony",
  "x": 2296,
  "y": 1726,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

## 🚀 Próximos Passos

Esta versão estabelece a base para:
- Expansão do sistema de notas com categorias e tags
- Integração com sistema de alarmes/lembretes
- Exportação de localizações para formatos externos
- Compartilhamento de localizações entre jogadores

## 📈 Estatísticas

- **Novos componentes React**: 3 (NotesTab, NotesSection, LocationsSection)
- **Novos modelos de dados**: 2 (Note, Location)
- **Novas tabelas SQL**: 2 (notes, locations)
- **Novos métodos de API**: 11 (6 para notas, 5 para localizações)
- **Formatos de URL suportados**: 2 (Yaga.host, WurmMaps.xyz)
- **Servidores suportados**: 3 (Harmony, Cadence, Melody)

---

**Nota**: Esta versão adiciona funcionalidades essenciais de organização pessoal, permitindo que os jogadores gerenciem suas tarefas e localizações importantes do jogo de forma integrada ao gerenciador de estoque.

