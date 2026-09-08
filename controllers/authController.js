const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const Usuario = require('../models/Usuario');

exports.exibirLogin = (req, res) => {
  res.render('auth/login', {
    titulo: 'Entrar',
    erro: null
  });
};

exports.exibirCadastro = (req, res) => {
  res.render('auth/cadastro', {
    titulo: 'Criar conta',
    erros: [],
    dados: {}
  });
};

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

    const { nome, email, senha } = req.body;

    const emailNormalizado = email.trim().toLowerCase();

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

exports.login = async (req, res, next) => {
  try {
    const erros = validationResult(req);

    if (!erros.isEmpty()) {
      return res.status(400).render('auth/login', {
        titulo: 'Entrar',
        erro: erros.array()[0].msg
      });
    }

    const email = req.body.email.trim().toLowerCase();
    const senha = req.body.senha;

    const usuario = await Usuario.buscarPorEmail(email);

    if (!usuario) {
      return res.status(401).render('auth/login', {
        titulo: 'Entrar',
        erro: 'E-mail ou senha inválidos.'
      });
    }

    const senhaValida = await bcrypt.compare(
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
      email: usuario.email,
      foto_url: usuario.foto_url || null
    };

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

exports.logout = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }

    res.clearCookie('eventhub.sid', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    return res.redirect('/login');
  });
};