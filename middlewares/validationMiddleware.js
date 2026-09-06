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
    .isLength({ min: 6 })
    .withMessage('A senha deve ter pelo menos 6 caracteres.')
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
    .isISO8601()
    .withMessage('Informe uma data válida.')
    .custom((valor) => {
      const dataEvento = new Date(`${valor}T00:00:00`);
      const hoje = new Date();

      hoje.setHours(0, 0, 0, 0);

      if (dataEvento < hoje) {
        throw new Error('A data do evento não pode estar no passado.');
      }

      return true;
    }),

  body('local')
    .trim()
    .notEmpty()
    .withMessage('Informe o local do evento.')
    .isLength({ min: 2, max: 150 })
    .withMessage('O local deve ter entre 2 e 150 caracteres.'),

  body('categoria')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('A categoria deve ter no máximo 50 caracteres.'),

  body('imagem_url')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Informe uma URL de imagem válida.'),

  body('tipo_ingresso')
    .optional({ checkFalsy: true })
    .isIn(['gratuito', 'pago'])
    .withMessage('Selecione um tipo de ingresso válido.'),

  body('preco')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Informe um preço válido.'),

  body('link_ingresso')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Informe um link de ingresso válido.'),

  body('cupom')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 50 })
    .withMessage('O cupom deve ter no máximo 50 caracteres.'),

  body('vagas')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('O número de vagas deve ser maior que zero.')
];

exports.validarId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Identificador inválido.')
];