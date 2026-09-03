# 🎟️ EventHub

O **EventHub** é uma aplicação web para gerenciamento de eventos e inscrições, desenvolvida com **Node.js, Express, EJS e MySQL**, seguindo a arquitetura **MVC (Model-View-Controller)**.

O sistema permite a criação de contas com diferentes perfis de acesso. Organizadores podem gerenciar seus próprios eventos, enquanto participantes podem visualizar os eventos disponíveis e realizar suas inscrições.

Este projeto surgiu inicialmente como uma atividade acadêmica e posteriormente foi aprimorado e personalizado para integrar meu portfólio de desenvolvimento.

## ✨ Funcionalidades

### 👤 Usuários
- Cadastro de usuários
- Login e logout
- Senhas armazenadas de forma segura utilizando bcrypt
- Sessões de autenticação
- Perfis distintos de **organizador** e **participante**

### 📅 Organizadores
- Criação de eventos
- Edição dos próprios eventos
- Exclusão dos próprios eventos
- Validação das informações cadastradas
- Bloqueio de criação de eventos com datas passadas

### 🎫 Participantes
- Visualização dos eventos disponíveis
- Visualização dos detalhes de cada evento
- Inscrição em eventos
- Prevenção de inscrições duplicadas
- Visualização das próprias inscrições
- Cancelamento de inscrições

## 🛠️ Tecnologias utilizadas

- **Node.js** — ambiente de execução JavaScript
- **Express** — servidor e gerenciamento de rotas
- **EJS** — renderização das páginas
- **MySQL** — banco de dados relacional
- **mysql2** — integração entre Node.js e MySQL
- **bcryptjs** — criptografia das senhas
- **express-session** — gerenciamento de sessões
- **express-validator** — validação dos dados
- **dotenv** — gerenciamento das variáveis de ambiente
- **HTML5 e CSS3** — estrutura e estilização da interface

## 🏗️ Arquitetura

O projeto utiliza o padrão **MVC**, separando as responsabilidades da aplicação:

```text
eventhub-mvc/
│
├── config/          # Configuração do banco de dados
├── controllers/     # Regras e controle das requisições
├── middlewares/     # Autenticação e validações
├── models/          # Comunicação com o banco de dados
├── public/          # CSS, JavaScript e imagens
├── routes/          # Rotas da aplicação
├── views/           # Páginas EJS
│
├── app.js
├── package.json
└── .env.example
```

## 🚀 Como executar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/ariannedemattos-aam/eventhub-mvc.git
```

Entre na pasta:

```bash
cd eventhub-mvc
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto utilizando o `.env.example` como referência.

Exemplo:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=eventhub

SESSION_SECRET=sua_chave_secreta
NODE_ENV=development
```

> O arquivo `.env` não deve ser enviado para o GitHub, pois pode conter informações sensíveis.

### 4. Configure o banco de dados

Crie um banco MySQL chamado `eventhub` e as tabelas necessárias para usuários, eventos e inscrições.

As principais relações utilizadas são:

- Um organizador pode criar vários eventos.
- Um participante pode se inscrever em vários eventos.
- Um usuário não pode realizar duas inscrições no mesmo evento.

### 5. Inicie a aplicação

```bash
npm start
```

Depois, acesse no navegador:

```text
http://localhost:3000
```

## 🔐 Segurança

O projeto possui algumas medidas básicas de segurança e controle de acesso:

- Hash de senhas utilizando bcrypt
- Autenticação baseada em sessão
- Validação de dados no backend
- Controle de acesso de acordo com o tipo de usuário
- Proteção das operações de edição e exclusão de eventos
- Proteção das inscrições pertencentes a cada participante
- Variáveis sensíveis armazenadas fora do código-fonte

## 💜 Identidade visual

A interface do EventHub foi personalizada com uma identidade visual baseada em tons de roxo, utilizando layout responsivo, cards, gradientes e componentes desenvolvidos especialmente para o projeto.

## 👩‍💻 Autora

**Arianne Arruda de Mattos**

Projeto desenvolvido para fins acadêmicos e de portfólio.