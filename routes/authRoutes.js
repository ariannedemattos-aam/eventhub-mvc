const express = require('express');

const authController = require('../controllers/authController');

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

router.post(
  '/logout',
  authController.logout
);

module.exports = router;