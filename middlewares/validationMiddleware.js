const { body, param } = require('express-validator');

exports.validarCadastro = [
  body('nome')
    .trim()
    .notEmpty()
    .withMessage('Informe seu nome.')
    .isLength({ min: 3, max: 100 })
    .withMessage('O nome deve ter entre 3 e 100 caracteres.'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Informe seu e-mail.')
    .isEmail()
    .withMessage('Informe um e-mail válido.')
    .normalizeEmail(),

  body('senha')
    .notEmpty()
    .withMessage('Informe uma senha.')
    .isLength({ min: 6, max: 72 })
    .withMessage('A senha deve ter entre 6 e 72 caracteres.')
];

exports.validarLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Informe seu e-mail.')
    .isEmail()
    .withMessage('Informe um e-mail válido.')
    .normalizeEmail(),

  body('senha')
    .notEmpty()
    .withMessage('Informe sua senha.')
];

exports.validarPerfil = [
  body('nome')
    .trim()
    .notEmpty()
    .withMessage('Informe seu nome.')
    .isLength({ min: 3, max: 100 })
    .withMessage('O nome deve ter entre 3 e 100 caracteres.'),

  body('foto_url')
    .optional({ checkFalsy: true })
    .trim()
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true
    })
    .withMessage('Informe uma URL válida para a foto.'),

  body('bio')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('A bio deve ter no máximo 500 caracteres.'),

  body('cidade')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('A cidade deve ter no máximo 100 caracteres.'),

  body('site')
    .optional({ checkFalsy: true })
    .trim()
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true
    })
    .withMessage('Informe uma URL válida para o site.'),

  body('instagram')
    .optional({ checkFalsy: true })
    .trim()
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true
    })
    .withMessage('Informe uma URL válida para o Instagram.')
];

exports.validarEvento = [
  body('titulo')
    .trim()
    .notEmpty()
    .withMessage('Informe o título do evento.')
    .isLength({ min: 3, max: 150 })
    .withMessage('O título deve ter entre 3 e 150 caracteres.'),

  body('descricao')
    .trim()
    .notEmpty()
    .withMessage('Informe a descrição do evento.')
    .isLength({ min: 10, max: 2000 })
    .withMessage('A descrição deve ter entre 10 e 2000 caracteres.'),

  body('data')
    .notEmpty()
    .withMessage('Informe a data do evento.')
    .isISO8601({
      strict: true
    })
    .withMessage('Informe uma data válida.')
    .custom((valor) => {
      const dataEvento = new Date(`${valor}T00:00:00`);
      const hoje = new Date();

      hoje.setHours(0, 0, 0, 0);

      if (dataEvento < hoje) {
        throw new Error(
          'A data do evento não pode estar no passado.'
        );
      }

      return true;
    }),

  body('local')
    .trim()
    .notEmpty()
    .withMessage('Informe o local do evento.')
    .isLength({ min: 2, max: 150 })
    .withMessage('O local deve ter entre 2 e 150 caracteres.'),

  body('categoria_id')
    .notEmpty()
    .withMessage('Selecione uma categoria.')
    .isInt({ min: 1 })
    .withMessage('Selecione uma categoria válida.'),

  body('imagem_url')
    .optional({ checkFalsy: true })
    .trim()
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true
    })
    .withMessage('Informe uma URL de imagem válida.'),

  body('tipo_ingresso')
    .notEmpty()
    .withMessage('Selecione o tipo de ingresso.')
    .isIn(['gratuito', 'pago'])
    .withMessage('Selecione um tipo de ingresso válido.'),

  body('preco')
    .custom((valor, { req }) => {
      if (req.body.tipo_ingresso !== 'pago') {
        return true;
      }

      if (
        valor === undefined ||
        valor === null ||
        String(valor).trim() === ''
      ) {
        throw new Error(
          'Informe o preço do evento pago.'
        );
      }

      const preco = Number(valor);

      if (
        !Number.isFinite(preco) ||
        preco < 0
      ) {
        throw new Error('Informe um preço válido.');
      }

      return true;
    }),

  body('link_ingresso')
    .custom((valor, { req }) => {
      if (req.body.tipo_ingresso !== 'pago') {
        return true;
      }

      if (!valor || !String(valor).trim()) {
        throw new Error(
          'Informe o link para compra do ingresso.'
        );
      }

      try {
        const url = new URL(String(valor).trim());

        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error();
        }
      } catch {
        throw new Error(
          'Informe um link de ingresso válido.'
        );
      }

      return true;
    }),

  body('cupom')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('O cupom deve ter no máximo 50 caracteres.'),

  body('vagas')
    .custom((valor, { req }) => {
      if (req.body.tipo_ingresso !== 'gratuito') {
        return true;
      }

      if (
        valor === undefined ||
        valor === null ||
        String(valor).trim() === ''
      ) {
        return true;
      }

      const vagas = Number(valor);

      if (
        !Number.isInteger(vagas) ||
        vagas < 1
      ) {
        throw new Error(
          'O número de vagas deve ser maior que zero.'
        );
      }

      return true;
    })
];

exports.validarId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Identificador inválido.')
];