# Configuração de Auto-Update com Squirrel

Este documento descreve como configurar o sistema de auto-update usando Squirrel para Windows e macOS.

## Requisitos

1. **Repositório GitHub**: O código deve estar em um repositório GitHub público ou privado
2. **Releases no GitHub**: As versões devem ser publicadas como GitHub Releases
3. **Binários nomeados corretamente**: Os binários devem seguir a convenção de nomenclatura

## Convenção de Nomenclatura dos Binários

Para que o auto-update funcione, os binários devem seguir esta convenção:

### Windows
```
wurm-manager-windows-amd64.exe
wurm-manager-windows-386.exe
wurm-manager-windows-arm64.exe
```

### macOS
```
wurm-manager-darwin-amd64
wurm-manager-darwin-arm64
```

### Linux
```
wurm-manager-linux-amd64
wurm-manager-linux-386
wurm-manager-linux-arm64
```

## Processo de Release

### 0. Atualizar Versão no Código

Antes de criar um release, atualize a versão no arquivo `main.go`:

```go
// Versão da aplicação
const AppVersion = "0.2.1"  // ← Atualize aqui para a nova versão (ex: "0.2.2")
```

**Importante:**
- Use o formato semver (ex: "0.2.1", "1.0.0")
- Não inclua o prefixo "v" - ele será adicionado automaticamente na UI
- A versão será exibida automaticamente na interface e usada para verificar atualizações

### 1. Build dos Binários

Execute o build para todas as plataformas:

```bash
# Windows
wails build -platform windows/amd64 -clean

# macOS
wails build -platform darwin/amd64 -clean

# Linux (opcional)
wails build -platform linux/amd64 -clean
```

### 2. Renomear Binários

Após o build, renomeie os binários para seguir a convenção:

**Windows:**
```bash
# O binário será gerado em build/bin/wurm-manager.exe
# Renomeie para: wurm-manager-windows-amd64.exe
```

**macOS:**
```bash
# O binário será gerado em build/bin/wurm-manager
# Renomeie para: wurm-manager-darwin-amd64
```

### 3. Criar Release no GitHub

1. Acesse o repositório no GitHub
2. Vá em **Releases** → **Draft a new release**
3. Crie uma tag no formato `v0.2.1` (com o prefixo 'v')
4. Adicione o título e descrição do release
5. **Anexe os binários** renomeados
6. Publique o release

### 4. Verificar Configuração

No arquivo `main.go`, verifique se as constantes estão configuradas corretamente:

```go
const AppVersion = "0.2.1"  // Versão atual da aplicação
const GitHubOwner = "rcalvs"  // Owner do repositório GitHub
const GitHubRepo  = "deed-manager"  // Nome do repositório
```

O `UpdateService` usa automaticamente essas constantes, então você só precisa atualizar `AppVersion` quando criar um novo release (conforme descrito no passo 0).

## Como Funciona

1. **Verificação**: A aplicação verifica o GitHub Releases API para encontrar a versão mais recente
2. **Comparação**: Compara a versão atual com a versão mais recente usando semver
3. **Download**: Se houver atualização, baixa o binário apropriado para a plataforma atual
4. **Instalação**: Substitui o binário atual pelo novo (com suporte a rollback em caso de erro)
5. **Reinicialização**: A aplicação deve ser reiniciada manualmente após a atualização

## Uso na Aplicação

O sistema de auto-update está integrado no componente **Settings**:

1. Abra o menu de configurações (ícone de engrenagem)
2. Role até a seção "Atualizações"
3. Clique em "Verificar Atualizações"
4. Se houver atualização disponível, clique em "Instalar Atualização"

## Limitações

- **Windows e macOS**: Auto-update é suportado nativamente
- **Linux**: Pode funcionar, mas requer permissões adequadas para substituir o binário
- **Repositórios privados**: Requer autenticação GitHub (não implementado atualmente)

## Troubleshooting

### Erro: "erro ao verificar atualizações"

- Verifique sua conexão com a internet
- Verifique se o repositório está acessível
- Verifique se há releases públicos no GitHub

### Erro: "nenhuma atualização disponível"

- Verifique se o binário está nomeado corretamente
- Verifique se o release foi publicado corretamente
- Verifique se a tag do release segue o formato semver (v0.2.1)

### Atualização não aplica

- Verifique se a aplicação tem permissões de escrita no diretório do executável
- No Windows, pode ser necessário executar como administrador
- No macOS, pode ser necessário dar permissões de execução

## Referências

- [go-github-selfupdate](https://github.com/rhysd/go-github-selfupdate)
- [Squirrel.Windows](https://github.com/Squirrel/Squirrel.Windows)
- [Semantic Versioning](https://semver.org/)

