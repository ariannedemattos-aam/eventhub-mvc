# 🎟️ EventHub

O **EventHub** é uma plataforma web para **descobrir, divulgar e participar de eventos**, conectando participantes e organizadores em um único ambiente.

Desenvolvido com **Node.js, Express, EJS e MySQL**, o projeto utiliza a arquitetura **MVC (Model-View-Controller)** para separar as responsabilidades da aplicação e facilitar sua manutenção.

No EventHub, uma única conta pode participar de eventos e também publicar seus próprios eventos. Ao criar um evento, o usuário passa a ser o organizador daquela publicação, sem a necessidade de escolher previamente entre contas de participante ou organizador.

O projeto foi desenvolvido em uma **atividade voltada à construção de portfólio**, com o objetivo de aplicar na prática conceitos de desenvolvimento web, arquitetura MVC, autenticação, banco de dados, validação, upload de arquivos e deploy.

---

## 📸 Demonstração

### Explorar eventos

<!-- Adicionar screenshot da página Explorar eventos após o deploy final -->

### Detalhes de um evento

<!-- Adicionar screenshot da página de detalhes após o deploy final -->

### Perfil público

<!-- Adicionar screenshot de um perfil público após o deploy final -->

### Recomendações personalizadas

<!-- Adicionar screenshot da página "Para você" após o deploy final -->

---

## ✨ Funcionalidades

### 👤 Contas e perfis

- Cadastro de usuários
- Login e logout
- Autenticação baseada em sessão
- Senhas protegidas com hash utilizando bcrypt
- Perfil pessoal editável
- Perfil público
- Foto ou logo de perfil
- Upload de imagem pelo dispositivo ou uso de URL
- Biografia
- Cidade ou região
- Links opcionais para site e Instagram
- Visualização dos eventos organizados pelo usuário

### 📅 Eventos

- Criação de eventos
- Edição dos próprios eventos
- Exclusão dos próprios eventos
- Página de detalhes de cada evento
- Organização dos eventos por categorias
- Imagem de capa por upload ou URL
- Definição de data e local
- Eventos gratuitos e pagos
- Limite opcional de vagas para eventos gratuitos
- Preço para eventos pagos
- Link externo para compra de ingressos
- Cupom ou benefício opcional
- Validação das informações cadastradas
- Bloqueio de eventos com datas passadas

### 🎫 Inscrições

- Inscrição em eventos gratuitos
- Prevenção de inscrições duplicadas
- Bloqueio de inscrição no próprio evento
- Controle de vagas disponíveis
- Visualização das próprias inscrições
- Cancelamento de inscrições
- Separação entre eventos futuros e histórico

### 🔎 Exploração

- Pesquisa de eventos
- Filtro por categoria
- Filtro por localização
- Filtro por período
- Filtro entre eventos gratuitos e pagos
- Exibição de eventos disponíveis

### ❤️ Favoritos e interesses

- Adição e remoção de eventos favoritos
- Área de eventos favoritados
- Recurso **"Quero mais como este"**
- Registro das categorias de interesse do usuário
- Área para visualização dos interesses

### ✨ Recomendações personalizadas

A área **"Para você"** utiliza as categorias de interesse do usuário para recomendar eventos relacionados às suas preferências.

As recomendações consideram eventos futuros pertencentes às categorias de interesse e excluem eventos organizados pelo próprio usuário.

---

## 🛠️ Tecnologias utilizadas

- **Node.js** — ambiente de execução JavaScript
- **Express** — servidor web e gerenciamento de rotas
- **EJS** — renderização das páginas
- **MySQL** — banco de dados relacional
- **mysql2** — integração entre Node.js e MySQL
- **bcryptjs** — hash de senhas
- **express-session** — gerenciamento de sessões
- **express-mysql-session** — persistência das sessões no MySQL
- **express-validator** — validação dos dados
- **Multer** — processamento dos uploads de imagens
- **Cloudinary** — armazenamento das imagens de perfis e eventos
- **dotenv** — gerenciamento das variáveis de ambiente
- **HTML5** — estrutura das páginas
- **CSS3** — estilização e responsividade
- **JavaScript** — interações no frontend

---

## 🏗️ Estrutura do projeto

O EventHub segue a arquitetura **MVC (Model-View-Controller)**, mantendo separadas as responsabilidades relacionadas aos dados, controle das requisições e interface.

```text
eventhub-mvc/
│
├── config/
│   └── database.js
│
├── controllers/
│   ├── authController.js
│   ├── eventoController.js
│   ├── favoritoController.js
│   ├── inscricaoController.js
│   ├── interesseController.js
│   └── usuarioController.js
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── middlewares/
│   ├── authMiddleware.js
│   └── validationMiddleware.js
│
├── models/
│   ├── Categoria.js
│   ├── Evento.js
│   ├── Favorito.js
│   ├── Inscricao.js
│   ├── Interesse.js
│   └── Usuario.js
│
├── public/
│   ├── css/
│   │   └── style.css
│   ├── imagens/
│   │   └── logo.png
│   └── js/
│       └── main.js
│
├── routes/
│   ├── authRoutes.js
│   ├── eventoRoutes.js
│   ├── favoritoRoutes.js
│   ├── inscricaoRoutes.js
│   ├── interesseRoutes.js
│   └── usuarioRoutes.js
│
├── views/
│   ├── auth/
│   │   ├── cadastro.ejs
│   │   └── login.ejs
│   │
│   ├── eventos/
│   │   ├── criar.ejs
│   │   ├── detalhes.ejs
│   │   ├── editar.ejs
│   │   ├── index.ejs
│   │   ├── meus-eventos.ejs
│   │   └── para-voce.ejs
│   │
│   ├── favoritos/
│   │   └── index.ejs
│   │
│   ├── interesses/
│   │   └── index.ejs
│   │
│   ├── partials/
│   │   ├── evento-card.ejs
│   │   ├── footer.ejs
│   │   └── header.ejs
│   │
│   ├── perfil/
│   │   ├── editar.ejs
│   │   ├── meu-perfil.ejs
│   │   └── publico.ejs
│   │
│   ├── 404.ejs
│   ├── erro.ejs
│   └── minhas-inscricoes.ejs
│
├── .env.example
├── .gitignore
├── app.js
├── package-lock.json
├── package.json
└── README.md
```

### Organização

- **Models:** comunicação com o banco de dados
- **Views:** interface renderizada com EJS
- **Controllers:** controle das requisições e regras da aplicação
- **Routes:** definição dos endpoints
- **Middlewares:** autenticação e validação
- **Config:** configuração da conexão com o banco
- **Database:** scripts de criação e dados iniciais
- **Public:** CSS, JavaScript e imagens estáticas

---

## 🗄️ Banco de dados

O EventHub utiliza **MySQL** para persistência dos dados.

As principais entidades da aplicação são:

- Usuários
- Eventos
- Categorias
- Inscrições
- Favoritos
- Interesses

Entre as principais relações e regras implementadas:

- Um usuário pode organizar vários eventos
- Cada evento possui um usuário organizador
- Cada evento pertence a uma categoria
- Um usuário pode se inscrever em diferentes eventos
- Uma mesma inscrição não pode ser realizada duas vezes para o mesmo evento
- Um usuário não pode se inscrever no próprio evento
- Usuários podem favoritar diferentes eventos
- Usuários podem registrar diferentes categorias de interesse

---

## 🚀 Como executar

### 1. Clone o repositório

```bash
git clone https://github.com/ariannedemattos-aam/eventhub-mvc.git
```

Acesse a pasta:

```bash
cd eventhub-mvc
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto utilizando o `.env.example` como referência.

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=eventhub

SESSION_SECRET=sua_chave_secreta

CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret

NODE_ENV=development
```

> O arquivo `.env` contém informações sensíveis e não deve ser enviado ao repositório.

### 4. Configure o banco de dados

Os scripts SQL estão disponíveis em:

```text
database/
├── schema.sql
└── seed.sql
```

Para criar uma nova estrutura do banco, execute o `schema.sql`.

O `seed.sql` pode ser utilizado para inserir os dados iniciais.

> **Atenção:** o `schema.sql` é destinado à criação de uma nova estrutura e pode remover estruturas existentes. Não o execute sobre um banco com dados que precisam ser preservados.

### 5. Inicie a aplicação

```bash
npm start
```

Por padrão, a aplicação estará disponível em:

```text
http://localhost:3000
```

---

## 🔐 Segurança e validação

Entre as medidas implementadas na aplicação estão:

- Hash de senhas com bcrypt
- Autenticação baseada em sessão
- Persistência das sessões no MySQL
- Cookies de sessão `httpOnly`
- Cookies seguros no ambiente de produção
- Validação dos dados recebidos pelo backend
- Controle de autorização para edição e exclusão de eventos
- Proteção das operações vinculadas ao usuário autenticado
- Prevenção de inscrições duplicadas
- Variáveis sensíveis mantidas fora do código-fonte
- Configuração SSL para conexão com o banco em produção
- Validação de formato e limite de tamanho dos uploads

Os uploads de perfil e capa de eventos aceitam imagens **JPG, PNG e WEBP de até 5 MB**.

---

## 🎨 Interface

A interface do EventHub utiliza uma identidade visual baseada em tons de roxo e foi desenvolvida com CSS próprio.

O layout inclui:

- Cards de eventos
- Gradientes
- Formulários e componentes reutilizáveis
- Feedback visual para ações do usuário
- Navegação entre as diferentes áreas da plataforma
- Adaptação do layout para diferentes tamanhos de tela

A responsividade utiliza breakpoints específicos para reorganização da interface em telas menores.

---

## ☁️ Deploy

O EventHub possui deploy utilizando **Render**, com banco de dados **MySQL hospedado no Aiven** e armazenamento de imagens no **Cloudinary**.

<!-- Atualizar o link e esta seção após o deploy da versão final -->

**Aplicação:** `link da versão final após o deploy`

---

## 🎯 Sobre o projeto

O EventHub foi desenvolvido em uma **atividade voltada à criação de projetos para portfólio**, aplicando conceitos estudados em criação de sites em uma aplicação completa.

O projeto reúne autenticação, arquitetura MVC, persistência de dados, relacionamentos entre entidades, controle de acesso, filtros, recomendações, upload de arquivos e integração com serviços externos.

---

## 👩‍💻 Autora

**Arianne Arruda de Mattos**

Projeto desenvolvido para portfólio de desenvolvimento web.