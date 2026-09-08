const { validationResult } = require('express-validator');
const cloudinary = require('cloudinary').v2;

const Usuario = require('../models/Usuario');
const Evento = require('../models/Evento');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const separarEventos = (eventos) => {
  const agora = new Date();

  return {
    proximos: eventos.filter(
      (evento) => new Date(evento.data) >= agora
    ),
    anteriores: eventos.filter(
      (evento) => new Date(evento.data) < agora
    )
  };
};

const enviarFotoCloudinary = (arquivo, usuarioId) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'eventhub/perfis',
        public_id: `usuario_${usuarioId}`,
        overwrite: true,
        invalidate: true,
        resource_type: 'image',
        transformation: [
          {
            width: 800,
            height: 800,
            crop: 'limit'
          }
        ]
      },
      (error, resultado) => {
        if (error) {
          return reject(error);
        }

        return resolve(resultado.secure_url);
      }
    );

    stream.end(arquivo.buffer);
  });
};

exports.meuPerfil = async (req, res, next) => {
  try {
    const usuario = await Usuario.buscarPorId(
      req.session.usuario.id
    );

    if (!usuario) {
      return res.status(404).render('404', {
        titulo: 'Usuário não encontrado'
      });
    }

    const eventos = await Evento.listarPorUsuario(usuario.id);

    const { proximos, anteriores } =
      separarEventos(eventos);

    res.render('perfil/meu-perfil', {
      titulo: 'Meu perfil',
      perfil: usuario,
      proximos,
      anteriores
    });
  } catch (error) {
    next(error);
  }
};

exports.perfilPublico = async (req, res, next) => {
  try {
    const usuario = await Usuario.buscarPorId(req.params.id);

    if (!usuario) {
      return res.status(404).render('404', {
        titulo: 'Usuário não encontrado'
      });
    }

    const eventos = await Evento.listarPorUsuario(usuario.id);

    const { proximos, anteriores } =
      separarEventos(eventos);

    res.render('perfil/publico', {
      titulo: usuario.nome,
      perfil: usuario,
      proximos,
      anteriores
    });
  } catch (error) {
    next(error);
  }
};

exports.exibirEdicao = async (req, res, next) => {
  try {
    const usuario = await Usuario.buscarPorId(
      req.session.usuario.id
    );

    if (!usuario) {
      return res.status(404).render('404', {
        titulo: 'Usuário não encontrado'
      });
    }

    res.render('perfil/editar', {
      titulo: 'Editar perfil',
      perfil: usuario,
      erros: []
    });
  } catch (error) {
    next(error);
  }
};

exports.atualizar = async (req, res, next) => {
  try {
    const erros = validationResult(req);

    const usuario = await Usuario.buscarPorId(
      req.session.usuario.id
    );

    if (!usuario) {
      return res.status(404).render('404', {
        titulo: 'Usuário não encontrado'
      });
    }

    if (!erros.isEmpty()) {
      return res.status(400).render('perfil/editar', {
        titulo: 'Editar perfil',
        perfil: {
          ...usuario,
          ...req.body
        },
        erros: erros.array()
      });
    }

    let fotoUrl = req.body.foto_url?.trim() || null;

    if (req.file) {
      fotoUrl = await enviarFotoCloudinary(
        req.file,
        req.session.usuario.id
      );
    }

    const dados = {
      nome: req.body.nome.trim(),
      fotoUrl,
      bio: req.body.bio?.trim() || null,
      cidade: req.body.cidade?.trim() || null,
      site: req.body.site?.trim() || null,
      instagram: req.body.instagram?.trim() || null
    };

    await Usuario.atualizarPerfil(
      req.session.usuario.id,
      dados
    );

    req.session.usuario.nome = dados.nome;
    req.session.usuario.foto_url = dados.fotoUrl;

    req.session.save((error) => {
      if (error) {
        return next(error);
      }

      return res.redirect('/perfil');
    });
  } catch (error) {
    next(error);
  }
};