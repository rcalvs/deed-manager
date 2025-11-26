# Release v0.2.1 - Sistema de Notas e Localizações

## 🎉 Principais Novidades

### ✨ Nova Aba "Notas"
- **Seção Notas**: Sistema completo de to-do list
  - Criação, edição, exclusão e marcação de conclusão
  - Suporte a título, descrição, data de início e término
- **Seção Locais**: Gerenciamento de localizações do mapa
  - Cadastro com coordenadas X, Y
  - Suporte a múltiplos mapas (Yaga.host, WurmMaps.xyz)
  - Suporte a múltiplos servidores (Harmony, Cadence, Melody)

### 🔗 Parsing Automático de URLs
- Preenchimento automático de campos a partir de URLs
- Suporte para:
  - `https://harmony.yaga.host/#2296,1726`
  - `https://wurmmaps.xyz/Harmony/?x=2660&y=3211`
- Extração automática de servidor, tipo de mapa e coordenadas

### 🎨 Novo Tema em Tons de Cinza
- Background alterado de azul para cinza escuro
- Melhor contraste e legibilidade
- Acentos azuis mantidos em botões e elementos interativos

### 🐛 Correções
- Corrigido overflow em formulários
- Melhorias de scroll e acessibilidade
- Botões sempre acessíveis

## 📦 Novos Recursos

- **2 novas tabelas SQL**: `notes` e `locations`
- **11 novos métodos de API**: CRUD completo para notas e localizações
- **3 novos componentes React**: NotesTab, NotesSection, LocationsSection
- **2 formatos de URL suportados**: Yaga.host e WurmMaps.xyz

## 📈 Estatísticas

- **Novos modelos de dados**: 2
- **Novos componentes**: 3
- **Servidores suportados**: 3 (Harmony, Cadence, Melody)

