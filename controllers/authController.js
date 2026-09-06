const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const Usuario = require('../models/Usuario');

/**
 * Exibe a página de login.
 */
exports.exibirLogin = async (req, res, next) => {
  try {
    res.render('auth/login', {
      titulo: 'Entrar',
      erro: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Exibe a página de cadastro.
 */
exports.exibirCadastro = async (req, res, next) => {
  try {
    res.render('auth/cadastro', {
      titulo: 'Criar conta',
      erros: [],
      dados: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cadastra um novo usuário.
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

    const {
      nome,
      email,
      senha
    } = req.body;

    const emailNormalizado = email
      .trim()
      .toLowerCase();

    const usuarioExistente =
      await Usuario.buscarPorEmail(emailNormalizado);

    if (usuarioExistente) {
      return res.status(409).render('auth/cadastro', {
        titulo: 'Criar conta',
        erros: [
          {
            msg: 'Já existe uma conta cadastrada com este e-mail.'
          }
        ],
        dados: {
          nome,
          email: emailNormalizado
        }
      });
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    await Usuario.criar({
      nome: nome.trim(),
      email: emailNormalizado,
      senha: senhaHash
    });

    return res.redirect('/login');
  } catch (error) {
    next(error);
  }
};

/**
 * Autentica o usuário e cria a sessão.
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

    const email = req.body.email
      .trim()
      .toLowerCase();

    const senha = req.body.senha;

    const usuario =
      await Usuario.buscarPorEmail(email);

    if (!usuario) {
      return res.status(401).render('auth/login', {
        titulo: 'Entrar',
        erro: 'E-mail ou senha inválidos.'
      });
    }

    const senhaValida =
      await bcrypt.compare(
        senha,
        usuario.senha
      );

    if (!senhaValida) {
      return res.status(401).render('auth/login', {
        titulo: 'Entrar',
        erro: 'E-mail ou senha inválidos.'
      });
    }

    req.session.usuario = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email
    };

    /*
     * Força a sessão a ser salva antes do redirect.
     * Isso evita perder a autenticação no Render.
     */
    req.session.save((error) => {
      if (error) {
        return next(error);
      }

      return res.redirect('/eventos');
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Encerra a sessão.
 */
exports.logout = async (req, res, next) => {
  try {
    req.session.destroy((error) => {
      if (error) {
        return next(error);
      }

      res.clearCookie('connect.sid', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });

      return res.redirect('/login');
    });
  } catch (error) {
    next(error);
  }
};