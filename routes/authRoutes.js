const express = require('express');

const authController =
  require('../controllers/authController');

const {
  validarCadastro,
  validarLogin
} = require('../middlewares/validationMiddleware');

const router = express.Router();

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
  authController.exibirEsqueciSenha
);

router.post(
  '/esqueci-senha',
  authController.solicitarRecuperacao
);

router.get(
  '/redefinir-senha/:token',
  authController.exibirRedefinirSenha
);

router.post(
  '/redefinir-senha/:token',
  authController.redefinirSenha
);

router.post(
  '/logout',
  authController.logout
);

module.exports = router;