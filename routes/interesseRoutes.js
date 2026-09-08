const express = require('express');

const interesseController = require(
  '../controllers/interesseController'
);

const {
  autenticado
} = require('../middlewares/authMiddleware');

const {
  validarId
} = require('../middlewares/validationMiddleware');

const router = express.Router();

router.get(
  '/interesses',
  autenticado,
  interesseController.listar
);

router.post(
  '/interesses/:id/adicionar',
  autenticado,
  validarId,
  interesseController.adicionar
);

router.post(
  '/interesses/:id/remover',
  autenticado,
  validarId,
  interesseController.remover
);

router.post(
  '/eventos/:id/quero-mais',
  autenticado,
  validarId,
  interesseController.adicionarPorEvento
);

module.exports = router;