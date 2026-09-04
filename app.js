require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');

const authRoutes = require('./routes/authRoutes');
const eventoRoutes = require('./routes/eventoRoutes');
const inscricaoRoutes = require('./routes/inscricaoRoutes');

const app = express();

const PORT = process.env.PORT || 3000;

/*
 * Render usa proxy reverso HTTPS.
 * Sem isso, cookies secure podem não funcionar corretamente.
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
 * Sessão
 */
app.use(
  session({
    secret: process.env.SESSION_SECRET,

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
app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `EventHub rodando na porta ${PORT}`
  );
});