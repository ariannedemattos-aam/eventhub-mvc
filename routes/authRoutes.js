const express = require('express');

const authController =
  require('../controllers/authController');

const {
  validarCadastro,
  validarLogin
} = require('../middlewares/validationMiddleware');

const router = express.Router();

const somenteDesenvolvimento = (
  req,
  res,
  next
) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).render('404', {
      titulo: 'Página não encontrada'
    });
  }

  next();
};

router.get(
  '/login',
  authController.exibirLogin
);

router.post(
  '/login',
  validarLogin,
  authController.login
);

router.get(
  '/cadastro',
  authController.exibirCadastro
);

router.post(
  '/cadastro',
  validarCadastro,
  authController.cadastrar
);

router.get(
  '/esqueci-senha',
  somenteDesenvolvimento,
  authController.exibirEsqueciSenha
);

router.post(
  '/esqueci-senha',
  somenteDesenvolvimento,
  authController.solicitarRecuperacao
);

router.get(
  '/redefinir-senha/:token',
  somenteDesenvolvimento,
  authController.exibirRedefinirSenha
);

router.post(
  '/redefinir-senha/:token',
  somenteDesenvolvimento,
  authController.redefinirSenha
);

router.post(
  '/logout',
  authController.logout
);

module.exports = router;