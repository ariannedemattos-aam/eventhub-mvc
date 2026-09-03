const express = require('express');

const eventoController = require('../controllers/eventoController');

const {
  autenticado,
  organizador
} = require('../middlewares/authMiddleware');

const {
  validarEvento,
  validarId
} = require('../middlewares/validationMiddleware');

const router = express.Router();

router.get(
  '/',
  eventoController.listar
);

router.get(
  '/novo',
  autenticado,
  organizador,
  eventoController.exibirCriacao
);

router.post(
  '/',
  autenticado,
  organizador,
  validarEvento,
  eventoController.criar
);

router.get(
  '/:id',
  validarId,
  eventoController.detalhes
);

router.get(
  '/:id/editar',
  autenticado,
  organizador,
  validarId,
  eventoController.exibirEdicao
);

router.post(
  '/:id/editar',
  autenticado,
  organizador,
  validarId,
  validarEvento,
  eventoController.atualizar
);

router.post(
  '/:id/excluir',
  autenticado,
  organizador,
  validarId,
  eventoController.excluir
);

module.exports = router;