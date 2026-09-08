const express = require('express');
const multer = require('multer');

const usuarioController = require(
  '../controllers/usuarioController'
);

const {
  autenticado
} = require('../middlewares/authMiddleware');

const {
  validarPerfil,
  validarId
} = require('../middlewares/validationMiddleware');

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
          'A foto deve estar em formato JPG, PNG ou WEBP.'
        )
      );
    }

    return callback(null, true);
  }
});

const uploadFotoPerfil = (req, res, next) => {
  upload.single('foto')(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).render('erro', {
          titulo: 'Imagem muito grande',
          mensagem:
            'A foto do perfil deve ter no máximo 5 MB.'
        });
      }
    }

    return res.status(400).render('erro', {
      titulo: 'Imagem inválida',
      mensagem:
        error.message || 'Não foi possível enviar a imagem.'
    });
  });
};

router.get(
  '/perfil',
  autenticado,
  usuarioController.meuPerfil
);

router.get(
  '/perfil/editar',
  autenticado,
  usuarioController.exibirEdicao
);

router.post(
  '/perfil/editar',
  autenticado,
  uploadFotoPerfil,
  validarPerfil,
  usuarioController.atualizar
);

router.get(
  '/usuarios/:id',
  validarId,
  usuarioController.perfilPublico
);

module.exports = router;