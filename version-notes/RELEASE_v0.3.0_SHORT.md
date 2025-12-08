# Release v0.3.0 - Sistema de Eventos e Logs em Tempo Real

## 🎉 Principais Novidades

### 📡 Sistema de Leitura de Logs
- **Configuração de logs**: Modal para configurar caminho dos logs do Wurm
- **Permissões macOS**: Configuração adequada de permissões
- **Toggle de segurança**: "Allow Logs Communications" para controle do usuário

### 💬 Chat de Trade em Tempo Real
- **Leitura automática**: Polling das últimas 10 mensagens do `Trade.YYYY-MM.txt`
- **Atualização em tempo real**: Novas mensagens aparecem automaticamente
- **Dropdown expansível**: Economiza espaço quando colapsado
- **Auto-scroll**: Scroll automático para última mensagem

### 📢 Chat de Events em Tempo Real
- **Leitura automática**: Polling das últimas 10 mensagens do `_Event.YYYY-MM.txt`
- **Processamento especial**: Detecta e processa mensagens automaticamente
- **Mesmas funcionalidades do Trade**: Dropdown, auto-scroll, toggle

### 🔔 Sistema de Alarmes
- **Configuração por chat**: Alarmes separados para Trade e Events
- **Palavras-chave**: Múltiplas palavras separadas por vírgula
- **Volume configurável**: Slider para ajustar volume (0-100%)
- **Botão de teste**: Testa o volume antes de salvar

### 🔔 Central de Notificações
- **Badge de contagem**: Mostra número de notificações não lidas
- **Dropdown no header**: Acesso rápido às notificações
- **Modal de detalhes**: Visualização completa da mensagem
- **Deletar notificações**: Remover individuais ou todas

### 💰 Sistema de Balance Automático
- **Detecção automática**: Detecta 6 formatos diferentes de mensagens
- **Atualização em tempo real**: Balance atualizado no header
- **Conversão de moedas**: Converte entre iron, copper, silver e gold
- **Subtração de cobranças**: Detecta e subtrai cobranças automaticamente

### ⚙️ Calibração Automática do Tempo
- **Detecção automática**: Detecta comando `/time` no chat de Events
- **Parsing inteligente**: Suporta múltiplos formatos do comando
- **Calibração automática**: Calcula e salva nova época automaticamente
- **Atualização do calendário**: Calendário atualizado automaticamente

## 🎨 Melhorias de Interface

- **Aba Events**: Layout organizado com dropdowns expansíveis
- **Header**: Balance display e central de notificações
- **Modais**: Interfaces limpas para configuração

## 🔧 Melhorias Técnicas

- **Novos serviços Go**: LogsService para leitura de logs
- **Novos componentes React**: 5 componentes principais
- **Utilitários atualizados**: Suporte a múltiplos formatos
- **Permissões macOS**: Configuração adequada

## 📦 Novos Recursos

- Sistema de logs completo
- Sistema de alarmes configurável
- Central de notificações
- Balance automático
- Calibração automática via comando `/time`

## 📈 Estatísticas

- **Novos componentes**: 5
- **Novos serviços Go**: 1
- **Formatos suportados**: 6 (balance) + 2 (time command)
- **Linhas de código**: ~2000 adicionadas

## 🐛 Correções

- ✅ Parsing de moedas para todos os formatos
- ✅ Conversão de moedas correta
- ✅ Detecção de múltiplos formatos de comando `/time`
- ✅ Permissões macOS configuradas

