const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');

const Usuario = require('../models/Usuario');

const criarTransportadorEmail = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
};

const gerarHashToken = (token) => {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
};

exports.exibirLogin = (req, res) => {
  res.render('auth/login', {
    titulo: 'Entrar',
    erro: null,
    sucesso: req.query.redefinida
      ? 'Senha redefinida com sucesso. Você já pode entrar.'
      : null
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
        erro: erros.array()[0].msg,
        sucesso: null
      });
    }

    const email = req.body.email.trim().toLowerCase();
    const senha = req.body.senha;

    const usuario = await Usuario.buscarPorEmail(email);

    if (!usuario) {
      return res.status(401).render('auth/login', {
        titulo: 'Entrar',
        erro: 'E-mail ou senha inválidos.',
        sucesso: null
      });
    }

    const senhaValida = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaValida) {
      return res.status(401).render('auth/login', {
        titulo: 'Entrar',
        erro: 'E-mail ou senha inválidos.',
        sucesso: null
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

exports.exibirEsqueciSenha = (req, res) => {
  res.render('auth/esqueci-senha', {
    titulo: 'Recuperar senha',
    erro: null,
    sucesso: null
  });
};

exports.solicitarRecuperacao = async (req, res, next) => {
  try {
    const email = (req.body.email || '')
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).render('auth/esqueci-senha', {
        titulo: 'Recuperar senha',
        erro: 'Informe seu e-mail.',
        sucesso: null
      });
    }

    const usuario = await Usuario.buscarPorEmail(email);

    /*
      A resposta é a mesma mesmo quando o e-mail não existe.
      Isso evita revelar quais endereços possuem conta no EventHub.
    */
    const mensagemSucesso =
      'Se existir uma conta com este e-mail, você receberá um link para redefinir sua senha.';

    if (!usuario) {
      return res.render('auth/esqueci-senha', {
        titulo: 'Recuperar senha',
        erro: null,
        sucesso: mensagemSucesso
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = gerarHashToken(token);

    const expiracao = new Date(
      Date.now() + 30 * 60 * 1000
    );

    await Usuario.salvarTokenRecuperacao(
      usuario.id,
      tokenHash,
      expiracao
    );

    const appUrl =
      process.env.APP_URL || 'http://localhost:3000';

    const linkRecuperacao =
      `${appUrl}/redefinir-senha/${token}`;

    const transportador = criarTransportadorEmail();

    await transportador.sendMail({
      from: `"EventHub" <${process.env.EMAIL_USER}>`,
      to: usuario.email,
      subject: 'Redefinição de senha - EventHub',
      text: `
Olá, ${usuario.nome}!

Recebemos uma solicitação para redefinir a senha da sua conta no EventHub.

Acesse o link abaixo para criar uma nova senha:

${linkRecuperacao}

Este link é válido por 30 minutos.

Se você não solicitou a redefinição, ignore este e-mail.

EventHub
      `.trim(),
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; color: #241f2e;">
          <h2 style="color: #4c1d95;">EventHub 💜</h2>

          <p>Olá, <strong>${usuario.nome}</strong>!</p>

          <p>
            Recebemos uma solicitação para redefinir a senha
            da sua conta no EventHub.
          </p>

          <p style="margin: 28px 0;">
            <a
              href="${linkRecuperacao}"
              style="
                display: inline-block;
                background: #7c3aed;
                color: #ffffff;
                text-decoration: none;
                padding: 12px 20px;
                border-radius: 10px;
                font-weight: bold;
              "
            >
              Redefinir minha senha
            </a>
          </p>

          <p>
            Este link é válido por <strong>30 minutos</strong>.
          </p>

          <p>
            Se você não solicitou a redefinição,
            pode ignorar este e-mail.
          </p>

          <hr style="border: 0; border-top: 1px solid #e8e0f5; margin: 28px 0;">

          <p style="font-size: 13px; color: #6b6475;">
            EventHub — descubra, divulgue e participe de eventos.
          </p>
        </div>
      `
    });

    return res.render('auth/esqueci-senha', {
      titulo: 'Recuperar senha',
      erro: null,
      sucesso: mensagemSucesso
    });
  } catch (error) {
    next(error);
  }
};

exports.exibirRedefinirSenha = async (
  req,
  res,
  next
) => {
  try {
    const { token } = req.params;
    const tokenHash = gerarHashToken(token);

    const usuario =
      await Usuario.buscarPorTokenRecuperacao(tokenHash);

    if (!usuario) {
      return res.status(400).render(
        'auth/redefinir-senha',
        {
          titulo: 'Redefinir senha',
          token: null,
          erro:
            'Este link é inválido ou expirou. Solicite uma nova recuperação de senha.',
          sucesso: null
        }
      );
    }

    return res.render('auth/redefinir-senha', {
      titulo: 'Redefinir senha',
      token,
      erro: null,
      sucesso: null
    });
  } catch (error) {
    next(error);
  }
};

exports.redefinirSenha = async (req, res, next) => {
  try {
    const { token } = req.params;

    const senha = req.body.senha || '';
    const confirmarSenha =
      req.body.confirmarSenha || '';

    if (senha.length < 6) {
      return res.status(400).render(
        'auth/redefinir-senha',
        {
          titulo: 'Redefinir senha',
          token,
          erro: 'A nova senha deve ter pelo menos 6 caracteres.',
          sucesso: null
        }
      );
    }

    if (senha !== confirmarSenha) {
      return res.status(400).render(
        'auth/redefinir-senha',
        {
          titulo: 'Redefinir senha',
          token,
          erro: 'As senhas informadas não coincidem.',
          sucesso: null
        }
      );
    }

    const tokenHash = gerarHashToken(token);

    const usuario =
      await Usuario.buscarPorTokenRecuperacao(tokenHash);

    if (!usuario) {
      return res.status(400).render(
        'auth/redefinir-senha',
        {
          titulo: 'Redefinir senha',
          token: null,
          erro:
            'Este link é inválido ou expirou. Solicite uma nova recuperação de senha.',
          sucesso: null
        }
      );
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    await Usuario.redefinirSenha(
      usuario.id,
      senhaHash
    );

    return res.redirect('/login?redefinida=1');
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