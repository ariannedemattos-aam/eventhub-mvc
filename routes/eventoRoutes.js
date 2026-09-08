const express = require('express');
const multer = require('multer');

const eventoController = require(
  '../controllers/eventoController'
);

const {
  autenticado
} = require('../middlewares/authMiddleware');

const {
  validarEvento,
  validarId
} = require(
  '../middlewares/validationMiddleware'
);

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024
  },

  fileFilter: (req, file, callback) => {
    const tiposPermitidos = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!tiposPermitidos.includes(file.mimetype)) {
      return callback(
        new Error(
          'A imagem deve estar em formato JPG, PNG ou WEBP.'
        )
      );
    }

    return callback(null, true);
  }
});

const uploadImagemEvento = (req, res, next) => {
  upload.single('imagem')(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (
      error instanceof multer.MulterError &&
      error.code === 'LIMIT_FILE_SIZE'
    ) {
      return res.status(400).render('erro', {
        titulo: 'Imagem muito grande',
        mensagem:
          'A imagem do evento deve ter no máximo 5 MB.'
      });
    }

    return res.status(400).render('erro', {
      titulo: 'Imagem inválida',
      mensagem:
        error.message ||
        'Não foi possível enviar a imagem.'
    });
  });
};

router.get(
  '/',
  eventoController.listar
);

router.get(
  '/para-voce',
  autenticado,
  eventoController.paraVoce
);

router.get(
  '/meus-eventos',
  autenticado,
  eventoController.meusEventos
);

router.get(
  '/novo',
  autenticado,
  eventoController.exibirCriacao
);

router.post(
  '/',
  autenticado,
  uploadImagemEvento,
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
  uploadImagemEvento,
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