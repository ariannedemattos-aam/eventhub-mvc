const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const Usuario = require('../models/Usuario');

/**
 * Exibe a página de login.
 *
 * @async
 * @param {import('express').Request} req - Objeto da requisição HTTP.
 * @param {import('express').Response} res - Objeto da resposta HTTP.
 * @returns {Promise<void>}
 */
exports.exibirLogin = async (req, res) => {
  try {
    res.render('auth/login', {
      titulo: 'Entrar',
      erro: null
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Exibe a página de cadastro de usuário.
 *
 * @async
 * @param {import('express').Request} req - Objeto da requisição HTTP.
 * @param {import('express').Response} res - Objeto da resposta HTTP.
 * @returns {Promise<void>}
 */
exports.exibirCadastro = async (req, res) => {
  try {
    res.render('auth/cadastro', {
      titulo: 'Criar conta',
      erros: [],
      dados: {}
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Cadastra um novo usuário no sistema.
 *
 * Valida os dados recebidos, verifica se o e-mail já está cadastrado,
 * gera o hash da senha e salva o novo usuário no banco de dados.
 *
 * @async
 * @param {import('express').Request} req - Requisição contendo os dados do cadastro.
 * @param {import('express').Response} res - Objeto da resposta HTTP.
 * @param {import('express').NextFunction} next - Função para encaminhar erros ao middleware global.
 * @returns {Promise<void>}
 */
exports.cadastrar = async (req, res, next) => {
  try {
    const erros = validationResult(req);

    if (!erros.isEmpty()) {
      return res.status(400).render('auth/cadastro', {
        titulo: 'Criar conta',
        erros: erros.array(),
        dados: req.body
      });
    }

    const { nome, email, senha, tipo } = req.body;

    const usuarioExistente = await Usuario.buscarPorEmail(email);

    if (usuarioExistente) {
      return res.status(409).render('auth/cadastro', {
        titulo: 'Criar conta',
        erros: [{ msg: 'Já existe uma conta cadastrada com este e-mail.' }],
        dados: req.body
      });
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    await Usuario.criar({
      nome,
      email,
      senha: senhaHash,
      tipo
    });

    res.redirect('/login');
  } catch (error) {
    next(error);
  }
};

/**
 * Autentica um usuário e cria sua sessão.
 *
 * Verifica os dados enviados, busca o usuário pelo e-mail,
 * compara a senha informada com o hash armazenado e registra
 * os dados básicos do usuário na sessão.
 *
 * @async
 * @param {import('express').Request} req - Requisição contendo e-mail e senha.
 * @param {import('express').Response} res - Objeto da resposta HTTP.
 * @param {import('express').NextFunction} next - Função para encaminhar erros ao middleware global.
 * @returns {Promise<void>}
 */
exports.login = async (req, res, next) => {
  try {
    const erros = validationResult(req);

    if (!erros.isEmpty()) {
      return res.status(400).render('auth/login', {
        titulo: 'Entrar',
        erro: erros.array()[0].msg
      });
    }

    const { email, senha } = req.body;

    const usuario = await Usuario.buscarPorEmail(email);

    if (!usuario) {
      return res.status(401).render('auth/login', {
        titulo: 'Entrar',
        erro: 'E-mail ou senha inválidos.'
      });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).render('auth/login', {
        titulo: 'Entrar',
        erro: 'E-mail ou senha inválidos.'
      });
    }

    req.session.usuario = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo
    };

    if (usuario.tipo === 'organizador') {
      return res.redirect('/eventos');
    }

    res.redirect('/eventos');
  } catch (error) {
    next(error);
  }
};

/**
 * Encerra a sessão do usuário autenticado.
 *
 * Remove a sessão atual, limpa o cookie de sessão
 * e redireciona o usuário para a página de login.
 *
 * @async
 * @param {import('express').Request} req - Objeto da requisição HTTP.
 * @param {import('express').Response} res - Objeto da resposta HTTP.
 * @param {import('express').NextFunction} next - Função para encaminhar erros ao middleware global.
 * @returns {Promise<void>}
 */
exports.logout = async (req, res, next) => {
  try {
    req.session.destroy((error) => {
      if (error) {
        return next(error);
      }

      res.clearCookie('connect.sid');
      res.redirect('/login');
    });
  } catch (error) {
    next(error);
  }
};