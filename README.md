# 🤖 Projeto Sofia: Assistente Virtual

Assistente virtual do WhatsApp desenvolvido em Node.js e whatsapp-web.js para gerenciar consultas de alunos sobre informações financeiras e acadêmicas. O bot segue um fluxo de conversação guiado por estágios e utiliza o MongoDB para gerenciar o estado (stage) de cada usuário.

## 🌟 Visão Geral do Projeto

O fluxo da Sofia é baseado em uma máquina de estados:

- **Menu Inicial (Stage 0)**: O usuário escolhe entre 'Financeiro' ou 'Aulas/Provas'
- **Autenticação (Stage 0/subStage 'matricula')**: O bot solicita e verifica o número de matrícula
- **Menu de Estágio (Stage 2 ou 3)**: Após a matrícula, o usuário é direcionado ao menu específico do seu interesse (Financeiro ou Acadêmico)
- **Comandos Globais**: 
  - `sair` - reseta o atendimento para o Menu Inicial
  - `menu` - volta para o Menu Principal (Stage 1)

## 🗂️ Estrutura do Projeto

```
├── boletos/                   # Pasta para arquivos PDF de Boletos
├── academicos/                # Pasta para arquivos PDF/JPEG (Calendários)
├── src/
│   ├── config/
│   │   └── db.js              # Configuração de conexão com MongoDB Atlas
│   ├── models/
│   │   ├── User.js            # Esquema Mongoose para rastreamento de estado do usuário (Stage)
│   │   └── Boleto.js          # Esquema Mongoose para dados de Boleto (link/valor/vencimento)
│   └── stages/
│       ├── 1_auth.js          # Lógica do Menu Inicial, Matrícula e Menu Principal (Stages 0 e 1)
│       ├── 2_finance.js       # Lógica do Menu Financeiro e envio de Boletos (Stage 2)
│       └── 3_academic.js      # Lógica do Menu Acadêmico e envio de Calendários (Stage 3)
├── .env                       # Variáveis de ambiente
├── .gitignore
├── index.js                   # Orquestrador principal da Máquina de Estados
└── package.json
```

## ⚙️ Configuração e Instalação

### Pré-requisitos

- Node.js (versão LTS recomendada)
- MongoDB Atlas (ou instância local) para persistência de dados
- Chromium/Chrome instalado, necessário para o Puppeteer (whatsapp-web.js)

### Passos de Instalação

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/KeilynRosasDev/Assis-Sofia.git]

   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```
   *Dependências principais: whatsapp-web.js, dotenv, mongoose, path, fs*

3. **Crie a Estrutura de Pastas de Mídia:**
   ```bash
   mkdir boletos academicos
   ```
   É fundamental que as pastas de mídia estejam na raiz do projeto para que o `path.resolve` nos estágios 2 e 3 funcione corretamente. Coloque seus arquivos de teste (PDF e JPEG) nessas pastas.

4. **Configure o Arquivo .env:**
   Crie um arquivo chamado `.env` na raiz do projeto e adicione sua string de conexão do MongoDB:
   ```env
   # Variáveis de Ambiente
   MONGO_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/sofia_bot_db?retryWrites=true&w=majority"
   ```

## ▶️ Executando o Bot

Inicie o bot através do arquivo orquestrador:
```bash
node index.js
```

Ao executar pela primeira vez, será gerado um QR Code no terminal. Escaneie-o com seu WhatsApp para autenticar a sessão.

## 📄 Guia de Uso e Comandos

O bot gerencia o estado do usuário automaticamente.

### 1. Fluxo de Inicialização

| Passo | Comando/Opção | Ação do Bot |
|-------|---------------|-------------|
| Início | (Qualquer mensagem) | Exibe o Menu Inicial (1- Financeiro / 2- Aulas) |
| Opção | 1 ou 2 | Solicita o Número de Matrícula |
| Matrícula | 09042272 (Válida) | Direciona para o Menu de Estágio correspondente (Financeiro ou Acadêmico) |

### 2. Comandos Específicos

#### Menu Financeiro (Stage 2)

| Comando | Ação |
|---------|------|
| 1 | Busca e envia o Boleto atual (PDF) |
| 2 / menu | Volta para o Menu Principal (Stage 1) |
| 3 / sair | Reseta o atendimento (Stage 0) |

#### Menu Aulas e Provas (Stage 3)

| Comando | Ação |
|---------|------|
| 1 | Retorna a Data Final do Semestre (30/12/2025) |
| 2 | Envia o Calendário Acadêmico (PDF) |
| 3 | Envia o Calendário das atividades Online (AOL) (JPEG) |
| 4 / menu | Volta para o Menu Principal (Stage 1) |
| 5 / sair | Reseta o atendimento (Stage 0) |

### 3. Comandos Globais

Estes comandos são processados diretamente no `index.js` e funcionam em qualquer estágio:

| Comando | Ação |
|---------|------|
| menu | Força o retorno ao Menu Principal (Stage 1) |
| sair | Reseta o estágio do usuário para 0, pedindo a Matrícula novamente |

## 👨‍💻 Desenvolvimento

### Desenvolvedores

Este projeto foi desenvolvido por [Keilyn Rosas, Iêda Mascarenhas e Gabrielle Nascimento].

### Tecnologias Utilizadas

- **Node.js** - Ambiente de execução JavaScript
- **whatsapp-web.js** - Biblioteca para integração com WhatsApp
- **MongoDB Atlas** - Banco de dados em nuvem
- **Mongoose** - ODM para MongoDB
- **Puppeteer** - Automação do navegador

## 🚀 Melhorias Futuras

### Funcionalidades Planejadas

- [ ] **Integração com APIs Institucionais**: Conectar com sistemas acadêmicos e financeiros da instituição para dados em tempo real
- [ ] **Autenticação Segura**: Implementar sistema de autenticação mais robusto com verificação em duas etapas
- [ ] **Histórico de Consultas**: Armazenar e exibir histórico de consultas anteriores do aluno
- [ ] **Suporte a Múltiplos Idiomas**: Adicionar suporte para inglês e espanhol
- [ ] **Dashboard Administrativo**: Interface web para monitoramento e gestão do bot

### Melhorias Técnicas

- [ ] **Testes Automatizados**: Implementar suite de testes unitários e de integração
- [ ] **Logging Avançado**: Sistema de logs estruturados para melhor debugging
- [ ] **Cache de Dados**: Implementar cache para melhor performance em consultas frequentes
- [ ] **Containerização**: Dockerfile para facilitar deploy
- [ ] **Monitoramento**: Integração com ferramentas de monitoramento e alertas

### Expansões

- [ ] **Suporte a Outras Plataformas**: Expandir para Telegram e outros mensageiros
- [ ] **Chatbots Especializados**: Criar versões específicas para diferentes departamentos
- [ ] **Análise de Sentimento**: Adicionar análise de sentimentos para melhor atendimento
- [ ] **Sistema de Tickets**: Integrar com sistema de tickets para questões complexas
- [ ] **Abrir Chamados Automaticamnete**: Abrir chamado de forma mais rapida e de uma forma mais eficiente

## 📞 Suporte

Para questões técnicas ou sugestões de melhorias, entre em contato com a equipe de desenvolvimento.

---

**Projeto Sofia** - Assistente Virtual Acadêmica 