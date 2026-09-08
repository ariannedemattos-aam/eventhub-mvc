require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const authRoutes = require('./routes/authRoutes');
const eventoRoutes = require('./routes/eventoRoutes');
const inscricaoRoutes = require('./routes/inscricaoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const favoritoRoutes = require('./routes/favoritoRoutes');
const interesseRoutes = require('./routes/interesseRoutes');

const app = express();

const PORT = process.env.PORT || 3000;

/*
 * Render utiliza proxy reverso HTTPS.
 * Isso permite o funcionamento correto de cookies secure em produção.
 */
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

/*
 * Views
 */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/*
 * Parsers
 */
app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(express.json());

/*
 * Arquivos públicos
 */
app.use(
  express.static(
    path.join(__dirname, 'public')
  )
);

/*
 * Armazenamento persistente das sessões no MySQL.
 */
const sessionStoreConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  createDatabaseTable: true,

  expiration:
    1000 * 60 * 60 * 2,

  clearExpired: true,

  checkExpirationInterval:
    1000 * 60 * 15
};

if (process.env.NODE_ENV === 'production') {
  sessionStoreConfig.ssl = {
    rejectUnauthorized: false
  };
}

const sessionStore = new MySQLStore(
  sessionStoreConfig
);

/*
 * Sessão
 */
app.use(
  session({
    name: 'eventhub.sid',

    secret: process.env.SESSION_SECRET,

    store: sessionStore,

    resave: false,

    saveUninitialized: false,

    cookie: {
      httpOnly: true,

      secure:
        process.env.NODE_ENV === 'production',

      sameSite: 'lax',

      maxAge:
        1000 * 60 * 60 * 2
    }
  })
);

/*
 * Disponibiliza o usuário logado
 * para todas as páginas EJS.
 */
app.use((req, res, next) => {
  res.locals.usuario =
    req.session.usuario || null;

  next();
});

/*
 * Página inicial
 */
app.get('/', (req, res) => {
  res.redirect('/eventos');
});

/*
 * Rotas
 */
app.use(authRoutes);

app.use(
  '/eventos',
  eventoRoutes
);

app.use(inscricaoRoutes);
app.use(usuarioRoutes);
app.use(favoritoRoutes);
app.use(interesseRoutes);

/*
 * 404
 */
app.use((req, res) => {
  res.status(404).render('404', {
    titulo: 'Página não encontrada'
  });
});

/*
 * Tratamento global de erros
 */
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).render('erro', {
    titulo: 'Erro interno',

    mensagem:
      process.env.NODE_ENV === 'production'
        ? 'Ocorreu um erro interno no servidor.'
        : err.message
  });
});

/*
 * Servidor
 */
app.listen(
  PORT,
  '0.0.0.0',
  () => {
    console.log(
      `EventHub rodando na porta ${PORT}`
    );
  }
);