# Release v0.3.0 - Sistema de Eventos e Logs em Tempo Real

## 🎉 Novidades Principais

### 📡 Sistema de Leitura de Logs do Wurm Online
Implementação completa de um sistema para ler e processar logs do jogo em tempo real:

#### Funcionalidades
- **Configuração de logs**: Modal dedicado para configurar o caminho dos logs do Wurm
- **Permissões macOS**: Configuração adequada de permissões para acesso a arquivos
- **Toggle de segurança**: "Allow Logs Communications" para controle explícito do usuário
- **Validação de caminho**: Verificação de existência e acessibilidade do diretório
- **Persistência**: Caminho salvo no localStorage para uso futuro

#### Benefícios
- **Segurança**: Usuário tem controle total sobre quando os logs são lidos
- **Flexibilidade**: Suporta diferentes estruturas de diretórios
- **Transparência**: Interface clara sobre o que está sendo acessado

### 💬 Chat de Trade em Tempo Real
Sistema completo para monitorar o chat de Trade do jogo:

#### Funcionalidades
- **Leitura automática**: Polling das últimas 10 mensagens do arquivo `Trade.YYYY-MM.txt`
- **Atualização em tempo real**: Novas mensagens aparecem automaticamente
- **Auto-scroll**: Scroll automático para a última mensagem
- **Dropdown expansível**: Economiza espaço na tela quando colapsado
- **Toggle on/off**: Controle para habilitar/desabilitar o monitoramento
- **Indicador visual**: Mostra quando está carregando ou com erro

#### Benefícios
- **Monitoramento contínuo**: Não precisa ficar olhando o jogo
- **Histórico**: Mantém últimas 50 mensagens visíveis
- **Performance**: Polling otimizado a cada 2 segundos
- **Interface limpa**: Dropdown permite economizar espaço

### 📢 Chat de Events em Tempo Real
Sistema para monitorar eventos importantes do jogo:

#### Funcionalidades
- **Leitura automática**: Polling das últimas 10 mensagens do arquivo `_Event.YYYY-MM.txt`
- **Mesmas funcionalidades do Trade**: Dropdown, auto-scroll, toggle, etc.
- **Processamento especial**: Detecta e processa mensagens específicas automaticamente

#### Benefícios
- **Monitoramento de eventos**: Acompanha eventos importantes do jogo
- **Processamento inteligente**: Detecta e processa mensagens automaticamente
- **Interface consistente**: Mesma experiência do chat de Trade

### 🔔 Sistema de Alarmes
Sistema completo de alertas baseado em palavras-chave:

#### Funcionalidades
- **Configuração por chat**: Alarmes separados para Trade e Events
- **Palavras-chave**: Múltiplas palavras separadas por vírgula
- **Volume configurável**: Slider para ajustar volume do alarme (0-100%)
- **Botão de teste**: Testa o volume antes de salvar
- **Som de alarme**: Bip gerado via Web Audio API
- **Toggle on/off**: Habilita/desabilita alarmes independentemente

#### Benefícios
- **Alertas personalizados**: Configure o que é importante para você
- **Controle de volume**: Ajuste conforme necessário
- **Teste antes de usar**: Verifique se o volume está adequado
- **Flexibilidade**: Diferentes configurações para Trade e Events

### 🔔 Central de Notificações
Sistema completo de notificações para não perder eventos importantes:

#### Funcionalidades
- **Badge de contagem**: Mostra número de notificações não lidas
- **Dropdown no header**: Acesso rápido às notificações
- **Lista de notificações**: Todas as notificações em um só lugar
- **Modal de detalhes**: Visualização completa da mensagem e data
- **Marcar como lida**: Notificações são marcadas ao abrir
- **Deletar notificações**: Remover notificações individuais ou todas
- **Persistência**: Notificações salvas no localStorage

#### Benefícios
- **Não perde eventos**: Notificações persistem mesmo se não ouvir o alarme
- **Histórico completo**: Veja todas as notificações anteriores
- **Interface intuitiva**: Fácil de acessar e gerenciar
- **Organização**: Mantém notificações organizadas e acessíveis

### 💰 Sistema de Balance Automático
Sistema inteligente para rastrear o saldo do personagem automaticamente:

#### Funcionalidades
- **Detecção automática**: Detecta múltiplos formatos de mensagens de balance
- **Atualização em tempo real**: Balance atualizado automaticamente no header
- **Conversão de moedas**: Converte entre iron, copper, silver e gold automaticamente
- **Subtração de cobranças**: Detecta e subtrai cobranças automaticamente
- **Formatação legível**: Exibe balance no formato "Xg, Ys, Zc, Wi"
- **Persistência**: Balance salvo no localStorage

#### Formatos Suportados
1. `Bank balance: 1g, 32s, 45c, 21i`
2. `You now have 1 gold, 32 silver, 43 copper and 21 iron in the bank.`
3. `Your available money in the bank is now 2 silver, 5 copper and 41 iron.`
4. `New balance: 1 silver, 5 copper and 41 iron.`
5. `You have been charged 1 copper.`
6. `The items are now available and you have been charged 1 silver and 1 copper.`

#### Benefícios
- **Rastreamento automático**: Não precisa anotar manualmente
- **Precisão**: Conversão automática entre moedas
- **Visibilidade**: Sempre visível no header do aplicativo
- **Histórico**: Mantém o último valor conhecido

### ⚙️ Calibração Automática do Tempo
Sistema para calibrar automaticamente o tempo do Wurm via comando `/time`:

#### Funcionalidades
- **Detecção automática**: Detecta comando `/time` no chat de Events
- **Parsing inteligente**: Suporta múltiplos formatos do comando
- **Calibração automática**: Calcula e salva nova época automaticamente
- **Atualização do calendário**: Calendário atualizado automaticamente após calibração
- **Notificação**: Notifica quando calibração é realizada

#### Formatos Suportados
1. `[HH:mm:ss] It is HH:mm:ss on day of the Wurm in week X of the starfall of the Y in the year of Z.`
2. `[HH:mm:ss] It is HH:mm:ss on day of Awakening in week X of the Y's starfall in the year of Z.`

#### Benefícios
- **Automação completa**: Não precisa abrir modal manualmente
- **Precisão**: Calibração baseada em dados reais do jogo
- **Conveniência**: Funciona automaticamente quando você executa `/time` no jogo

### 🎯 Notificações Automáticas
Sistema para notificar sobre eventos específicos:

#### Eventos que Geram Notificação
- **Atualização de balance**: Quando "Your available money in the bank is now..." aparece
- **Cobranças de itens**: Quando "The items are now available and you have been charged..." aparece
- **Affinity desenvolvida**: Quando "You realize that you have developed an affinity for..." aparece
- **Calibração automática**: Quando calibração é realizada via comando `/time`

#### Benefícios
- **Não perde eventos**: Notificações persistem mesmo se não ouvir o alarme
- **Histórico completo**: Veja todos os eventos importantes
- **Contexto**: Notificações incluem mensagem completa e data

## 🎨 Melhorias de Interface

### Aba Events
- **Layout organizado**: Dois blocos principais (Trade e Events)
- **Dropdowns expansíveis**: Economiza espaço quando não está em uso
- **Indicadores visuais**: Mostra status de carregamento e erros
- **Toggles intuitivos**: Controles claros para habilitar/desabilitar
- **Botões de alarme**: Acesso rápido à configuração de alarmes

### Header
- **Balance display**: Mostra balance atual do personagem
- **Central de notificações**: Badge com contagem de não lidas
- **Layout responsivo**: Adapta-se a diferentes tamanhos de tela

### Modais
- **LogsConfigModal**: Interface limpa para configurar caminho dos logs
- **AlarmConfigModal**: Configuração completa de alarmes com volume
- **NotificationModal**: Visualização detalhada de notificações

## 🔧 Melhorias Técnicas

### Backend (Go)

#### Novos Serviços
- **LogsService**: Serviço completo para leitura de logs
  - `ReadLastNLines()`: Lê últimas N linhas de um arquivo
  - `ReadCurrentTradeLogLastNLines()`: Lê últimas N linhas do Trade atual
  - `ReadCurrentEventsLogLastNLines()`: Lê últimas N linhas do Events atual
  - `GetLogsPath()`: Obtém caminho configurado dos logs
  - `SetLogsPath()`: Define caminho dos logs

#### Bindings
- **logs_bindings.go**: Bindings para comunicação frontend-backend
  - `ReadCurrentTradeLogLastNLines()`
  - `ReadCurrentEventsLogLastNLines()`
  - `GetLogsPath()`
  - `SetLogsPath()`

#### Permissões macOS
- **Info.plist**: Configuração de permissões para acesso a arquivos
- **wails.json**: Configuração de entitlements para macOS

### Frontend (React)

#### Novos Componentes
- **EventsTab**: Componente principal para monitoramento de eventos
  - Gerenciamento de estado para Trade e Events
  - Polling automático de mensagens
  - Processamento de mensagens para balance e calibração
  - Sistema de alarmes integrado

- **LogsConfigModal**: Modal para configuração de logs
  - Input de caminho
  - Validação de caminho
  - Persistência no localStorage

- **AlarmConfigModal**: Modal para configuração de alarmes
  - Input de palavras-chave
  - Toggle de ativação
  - Slider de volume
  - Botão de teste

- **NotificationCenter**: Componente de notificações no header
  - Badge de contagem
  - Dropdown de notificações
  - Gerenciamento de estado

- **NotificationModal**: Modal de detalhes de notificação
  - Exibição completa da mensagem
  - Data e hora
  - Botão de deletar

#### Utilitários Atualizados
- **wurmTime.js**: 
  - `parseTimeCommand()`: Suporte a múltiplos formatos (incluindo "Y's starfall")
  - Melhor detecção de formatos alternativos

#### Funções de Processamento
- **updateBalance()**: Processa mensagens para atualizar balance
  - Suporta 6 formatos diferentes de mensagens
  - Conversão automática de moedas
  - Subtração de cobranças

- **processTimeCommand()**: Processa comando `/time` para calibração
  - Detecção automática no chat de Events
  - Parsing de múltiplos formatos
  - Calibração e atualização automática

- **createNotification()**: Cria e gerencia notificações
  - Persistência no localStorage
  - Eventos customizados
  - Gerenciamento de IDs únicos

- **parseCurrency()**: Parser de moedas
  - Suporta formato abreviado (1g, 32s, 45c, 21i)
  - Suporta formato por extenso (1 gold, 32 silver, etc.)
  - Conversão robusta

- **convertToIron()**: Conversão para iron (base)
- **formatBalance()**: Formatação de balance para exibição
- **getCurrentBalance()**: Obtém balance atual do localStorage

#### Estrutura de Dados
- **localStorage keys**:
  - `wurm_logs_enabled`: Toggle de logs habilitado
  - `wurm_logs_path`: Caminho dos logs
  - `wurm_trade_enabled`: Trade chat habilitado
  - `wurm_event_enabled`: Events chat habilitado
  - `wurm_trade_alarm_*`: Configurações de alarme Trade
  - `wurm_event_alarm_*`: Configurações de alarme Events
  - `wurm_notifications`: Array de notificações
  - `wurm_read_notifications`: Set de IDs lidos
  - `wurm_balance`: Balance atual formatado

## 📦 Novos Recursos

### Sistema de Logs
- Leitura de arquivos de log do Wurm Online
- Suporte a Trade e Events logs
- Polling automático
- Validação de caminhos

### Sistema de Alarmes
- Palavras-chave configuráveis
- Volume ajustável
- Teste de som
- Alarmes separados por chat

### Sistema de Notificações
- Central de notificações
- Badge de contagem
- Histórico completo
- Deletar notificações

### Sistema de Balance
- Detecção automática
- Múltiplos formatos suportados
- Conversão de moedas
- Exibição no header

### Calibração Automática
- Detecção de comando `/time`
- Parsing automático
- Calibração e atualização

## 🎯 Impacto

### Experiência do Usuário
- **Monitoramento contínuo**: Não precisa ficar olhando o jogo
- **Alertas personalizados**: Configure o que é importante
- **Automação**: Balance e calibração automáticos
- **Histórico**: Notificações e mensagens persistem

### Funcionalidade
- **Integração com jogo**: Lê logs diretamente do jogo
- **Processamento inteligente**: Detecta e processa mensagens automaticamente
- **Flexibilidade**: Múltiplos formatos suportados
- **Performance**: Polling otimizado

### Manutenibilidade
- **Código organizado**: Componentes bem estruturados
- **Reutilização**: Funções compartilhadas entre Trade e Events
- **Extensibilidade**: Fácil adicionar novos formatos ou eventos
- **Validação**: Tratamento de erros robusto

## 📈 Estatísticas

- **Novos componentes**: 5 (EventsTab, LogsConfigModal, AlarmConfigModal, NotificationCenter, NotificationModal)
- **Novos serviços Go**: 1 (LogsService)
- **Novos bindings**: 4 funções principais
- **Componentes atualizados**: 3 (App.jsx, CalendarTab, wurmTime.js)
- **Arquivos CSS adicionados**: 4
- **Traduções adicionadas**: 3 idiomas (PT, EN, RU)
- **Formatos de mensagens suportados**: 6 (balance) + 2 (time command)
- **Linhas de código**: ~2000 linhas adicionadas

## 🐛 Correções

### Interface
- ✅ Dropdowns funcionando corretamente
- ✅ Auto-scroll funcionando apenas quando expandido
- ✅ Toggles não interferindo com dropdowns
- ✅ Balance formatado corretamente no header

### Funcionalidade
- ✅ Parsing de moedas funcionando para todos os formatos
- ✅ Conversão de moedas correta (100 iron = 1 copper, etc.)
- ✅ Detecção de múltiplos formatos de comando `/time`
- ✅ Calibração automática funcionando
- ✅ Notificações sendo criadas corretamente
- ✅ Alarmes funcionando para Trade e Events

### Backend
- ✅ Permissões macOS configuradas corretamente
- ✅ Leitura de arquivos funcionando
- ✅ Tratamento de erros robusto

## 🔄 Mudanças de Comportamento

### Logs
- **Antes**: Sem acesso a logs do jogo
- **Agora**: Leitura automática de logs com permissão do usuário

### Balance
- **Antes**: Manual
- **Agora**: Automático via detecção de mensagens

### Calibração
- **Antes**: Apenas manual via modal
- **Agora**: Manual via modal + automática via comando `/time`

### Notificações
- **Antes**: Apenas alarmes sonoros
- **Agora**: Alarmes sonoros + central de notificações

## 📝 Notas para Desenvolvedores

### Como Configurar Logs
1. Ir em Configurações
2. Ativar "Allow Logs Communications"
3. Configurar caminho dos logs (ex: `/Users/usuario/wurm/players/Personagem/logs`)
4. Salvar

### Formatos de Mensagens Suportados
O sistema detecta automaticamente múltiplos formatos de mensagens. Novos formatos podem ser adicionados facilmente na função `updateBalance()`.

### Adicionar Novos Eventos
Para adicionar novos eventos que geram notificações, adicione a detecção na função `updateBalance()` ou crie uma nova função de processamento.

### Permissões macOS
O aplicativo precisa de permissões para acessar arquivos. Isso é configurado em `wails.json` e `Info.plist`.

---

**Nota**: Esta versão adiciona funcionalidades avançadas de monitoramento em tempo real, permitindo que o usuário acompanhe eventos importantes do jogo sem precisar ficar olhando constantemente. O sistema de balance automático e calibração automática tornam o aplicativo ainda mais útil e conveniente.

