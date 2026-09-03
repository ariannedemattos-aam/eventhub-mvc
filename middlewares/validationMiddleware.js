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
    .withMessage('A senha deve ter pelo menos 6 caracteres.'),

  body('tipo')
    .isIn(['organizador', 'participante'])
    .withMessage('Selecione um tipo de usuário válido.')
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
    .withMessage('O local deve ter entre 2 e 150 caracteres.')
];

exports.validarId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Identificador inválido.')
];