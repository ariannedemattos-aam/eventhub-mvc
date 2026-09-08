const express = require('express');

const favoritoController = require(
  '../controllers/favoritoController'
);

const {
  autenticado
} = require('../middlewares/authMiddleware');

const {
  validarId
} = require('../middlewares/validationMiddleware');

const router = express.Router();

router.get(
  '/favoritos',
  autenticado,
  favoritoController.listar
);

router.post(
  '/eventos/:id/favoritar',
  autenticado,
  validarId,
  favoritoController.adicionar
);

router.post(
  '/eventos/:id/desfavoritar',
  autenticado,
  validarId,
  favoritoController.remover
);

module.exports = router;