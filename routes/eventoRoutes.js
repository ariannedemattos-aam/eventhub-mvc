const express = require('express');

const eventoController = require('../controllers/eventoController');

const {
  autenticado
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
  eventoController.exibirCriacao
);

router.get(
  '/meus-eventos',
  autenticado,
  eventoController.meusEventos
);

router.post(
  '/',
  autenticado,
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
  validarId,
  eventoController.exibirEdicao
);

router.post(
  '/:id/editar',
  autenticado,
  validarId,
  validarEvento,
  eventoController.atualizar
);

router.post(
  '/:id/excluir',
  autenticado,
  validarId,
  eventoController.excluir
);

module.exports = router;