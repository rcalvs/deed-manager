# Release v0.2.2 - Sistema de Tradução e Tela Inicial

## 🎉 Principais Novidades

### 🌍 Sistema de Tradução Completo
- **3 idiomas suportados**: Português, Inglês (padrão), Russo
- **Detecção automática**: Detecta idioma do navegador
- **Seletor de idioma**: Disponível na tela inicial e nas configurações
- **Tradução completa**: Todos os textos da interface traduzidos
- **Itens do estoque preservados**: Mantidos em inglês (padrão do jogo)

### 🎬 Tela Inicial de Boas-vindas
- **3 etapas interativas**:
  1. Boas-vindas com mensagem personalizada
  2. Apresentação das funcionalidades principais
  3. Configuração do nome do Deed (opcional)
- **Navegação intuitiva**: Botões "Voltar" e "Continuar"
- **Seletor de idioma**: Disponível desde a primeira tela

### 🎨 Componente de Seletor de Idioma
- **Variante compact**: Dropdown para tela inicial
- **Variante default**: Lista de opções para Settings
- **Visualização**: Bandeiras e nomes nativos dos idiomas
- **Persistência**: Idioma escolhido é salvo automaticamente

## 📦 Novos Recursos

- **Sistema i18n**: Integração com i18next e react-i18next
- **3 arquivos de tradução**: en.json, pt.json, ru.json
- **~200 chaves de tradução**: Cobertura completa da interface
- **2 novos componentes**: LanguageSelector, WelcomeScreen
- **Persistência de preferências**: localStorage para idioma e nome do Deed

## 🔧 Melhorias

- **Experiência de primeiro uso**: Tela inicial guiada e intuitiva
- **Personalização**: Nome do Deed exibido no header
- **Acessibilidade**: Interface no idioma nativo do usuário
- **Manutenibilidade**: Traduções organizadas em arquivos JSON

## 📈 Estatísticas

- **Idiomas suportados**: 3
- **Chaves de tradução**: ~200
- **Componentes traduzidos**: 10+
- **Novos componentes**: 2

