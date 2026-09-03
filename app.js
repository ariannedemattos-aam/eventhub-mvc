require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');

const authRoutes = require('./routes/authRoutes');
const eventoRoutes = require('./routes/eventoRoutes');
const inscricaoRoutes = require('./routes/inscricaoRoutes');

const app = express();

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 2
    }
  })
);

app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  next();
});

app.get('/', (req, res) => {
  res.redirect('/eventos');
});

app.use(authRoutes);
app.use('/eventos', eventoRoutes);
app.use(inscricaoRoutes);

app.use((req, res) => {
  res.status(404).render('404', {
    titulo: 'Página não encontrada'
  });
});

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

app.listen(PORT, () => {
  console.log(`EventHub rodando em http://localhost:${PORT}`);
});