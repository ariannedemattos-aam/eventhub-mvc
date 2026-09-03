const express = require('express');

const inscricaoController = require('../controllers/inscricaoController');

const {
  autenticado,
  participante
} = require('../middlewares/authMiddleware');

const {
  validarId
} = require('../middlewares/validationMiddleware');

const router = express.Router();

router.get(
  '/minhas-inscricoes',
  autenticado,
  participante,
  inscricaoController.minhasInscricoes
);

router.post(
  '/eventos/:id/inscrever',
  autenticado,
  participante,
  validarId,
  inscricaoController.inscrever
);

router.post(
  '/inscricoes/:id/cancelar',
  autenticado,
  participante,
  validarId,
  inscricaoController.cancelar
);

module.exports = router;