const express = require('express');

const inscricaoController = require(
  '../controllers/inscricaoController'
);

const {
  autenticado
} = require('../middlewares/authMiddleware');

const {
  validarId
} = require('../middlewares/validationMiddleware');

const router = express.Router();

router.get(
  '/minhas-inscricoes',
  autenticado,
  inscricaoController.minhasInscricoes
);

router.post(
  '/eventos/:id/inscrever',
  autenticado,
  validarId,
  inscricaoController.inscrever
);

router.post(
  '/inscricoes/:id/cancelar',
  autenticado,
  validarId,
  inscricaoController.cancelar
);

module.exports = router;