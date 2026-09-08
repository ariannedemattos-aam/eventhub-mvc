const { validationResult } = require('express-validator');
const cloudinary = require('cloudinary').v2;

const Evento = require('../models/Evento');
const Categoria = require('../models/Categoria');
const Favorito = require('../models/Favorito');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const enviarImagemCloudinary = (
  arquivo,
  usuarioId,
  identificador = Date.now()
) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'eventhub/eventos',
        public_id:
          `evento_${usuarioId}_${identificador}`,
        overwrite: true,
        invalidate: true,
        resource_type: 'image',
        transformation: [
          {
            width: 1600,
            height: 900,
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

const normalizarDadosEvento = (
  dados,
  imagemUrlPersonalizada = undefined
) => {
  const tipoIngresso =
    dados.tipo_ingresso || 'gratuito';

  const imagemUrl =
    imagemUrlPersonalizada !== undefined
      ? imagemUrlPersonalizada
      : dados.imagem_url?.trim() || null;

  return {
    titulo: dados.titulo?.trim(),
    descricao: dados.descricao?.trim(),
    data: dados.data,
    local: dados.local?.trim(),
    categoriaId: Number(dados.categoria_id),
    imagemUrl,
    tipoIngresso,

    preco:
      tipoIngresso === 'pago' && dados.preco
        ? Number(dados.preco)
        : null,

    linkIngresso:
      tipoIngresso === 'pago'
        ? dados.link_ingresso?.trim() || null
        : null,

    cupom:
      tipoIngresso === 'pago'
        ? dados.cupom?.trim() || null
        : null,

    vagas:
      tipoIngresso === 'gratuito' && dados.vagas
        ? Number(dados.vagas)
        : null
  };
};

exports.listar = async (req, res, next) => {
  try {
    const filtros = {
      busca: req.query.busca?.trim() || '',
      categoriaId: req.query.categoria || '',
      local: req.query.local?.trim() || '',
      periodo: req.query.periodo || '',
      tipoIngresso: req.query.tipo || ''
    };

    const [eventos, categorias] = await Promise.all([
      Evento.listarDisponiveis(filtros),
      Categoria.listarTodas()
    ]);

    res.render('eventos/index', {
      titulo: 'Eventos',
      eventos,
      categorias,
      filtros
    });
  } catch (error) {
    next(error);
  }
};

exports.paraVoce = async (req, res, next) => {
  try {
    const eventos = await Evento.listarRecomendados(
      req.session.usuario.id
    );

    res.render('eventos/para-voce', {
      titulo: 'Para você',
      eventos
    });
  } catch (error) {
    next(error);
  }
};

exports.meusEventos = async (req, res, next) => {
  try {
    const eventos = await Evento.listarPorUsuario(
      req.session.usuario.id
    );

    const agora = new Date();

    const proximos = eventos.filter(
      (evento) => new Date(evento.data) >= agora
    );

    const anteriores = eventos.filter(
      (evento) => new Date(evento.data) < agora
    );

    res.render('eventos/meus-eventos', {
      titulo: 'Meus eventos',
      proximos,
      anteriores
    });
  } catch (error) {
    next(error);
  }
};

exports.detalhes = async (req, res, next) => {
  try {
    const evento = await Evento.buscarPorId(req.params.id);

    if (!evento) {
      return res.status(404).render('404', {
        titulo: 'Evento não encontrado'
      });
    }

    let favoritado = false;

    if (req.session.usuario) {
      favoritado = Boolean(
        await Favorito.buscarPorUsuarioEEvento(
          req.session.usuario.id,
          evento.id
        )
      );
    }

    res.render('eventos/detalhes', {
      titulo: evento.titulo,
      evento,
      favoritado,
      interesseStatus:
        req.query.interesse || null
    });
  } catch (error) {
    next(error);
  }
};

exports.exibirCriacao = async (req, res, next) => {
  try {
    const categorias = await Categoria.listarTodas();

    res.render('eventos/criar', {
      titulo: 'Criar evento',
      erros: [],
      dados: {},
      categorias
    });
  } catch (error) {
    next(error);
  }
};

exports.criar = async (req, res, next) => {
  try {
    const erros = validationResult(req);

    const categorias = await Categoria.listarTodas();

    if (!erros.isEmpty()) {
      return res.status(400).render('eventos/criar', {
        titulo: 'Criar evento',
        erros: erros.array(),
        dados: req.body,
        categorias
      });
    }

    let imagemUrl =
      req.body.imagem_url?.trim() || null;

    if (req.file) {
      imagemUrl = await enviarImagemCloudinary(
        req.file,
        req.session.usuario.id
      );
    }

    const dadosEvento = normalizarDadosEvento(
      req.body,
      imagemUrl
    );

    await Evento.criar({
      ...dadosEvento,
      organizadorId: req.session.usuario.id
    });

    return res.redirect('/eventos/meus-eventos');
  } catch (error) {
    next(error);
  }
};

exports.exibirEdicao = async (req, res, next) => {
  try {
    const [evento, categorias] = await Promise.all([
      Evento.buscarPorId(req.params.id),
      Categoria.listarTodas()
    ]);

    if (!evento) {
      return res.status(404).render('404', {
        titulo: 'Evento não encontrado'
      });
    }

    if (
      evento.organizador_id !==
      req.session.usuario.id
    ) {
      return res.status(403).render('erro', {
        titulo: 'Acesso negado',
        mensagem:
          'Você não pode editar este evento.'
      });
    }

    res.render('eventos/editar', {
      titulo: 'Editar evento',
      evento,
      erros: [],
      categorias
    });
  } catch (error) {
    next(error);
  }
};

exports.atualizar = async (req, res, next) => {
  try {
    const erros = validationResult(req);

    const [evento, categorias] = await Promise.all([
      Evento.buscarPorId(req.params.id),
      Categoria.listarTodas()
    ]);

    if (!evento) {
      return res.status(404).render('404', {
        titulo: 'Evento não encontrado'
      });
    }

    if (
      evento.organizador_id !==
      req.session.usuario.id
    ) {
      return res.status(403).render('erro', {
        titulo: 'Acesso negado',
        mensagem:
          'Você não pode editar este evento.'
      });
    }

    if (!erros.isEmpty()) {
      return res.status(400).render(
        'eventos/editar',
        {
          titulo: 'Editar evento',

          evento: {
            ...evento,
            ...req.body
          },

          erros: erros.array(),
          categorias
        }
      );
    }

    let imagemUrl =
      req.body.imagem_url?.trim() || null;

    if (req.file) {
      imagemUrl = await enviarImagemCloudinary(
        req.file,
        req.session.usuario.id,
        req.params.id
      );
    }

    const dadosEvento = normalizarDadosEvento(
      req.body,
      imagemUrl
    );

    await Evento.atualizar(
      req.params.id,
      dadosEvento
    );

    return res.redirect(
      `/eventos/${req.params.id}`
    );
  } catch (error) {
    next(error);
  }
};

exports.excluir = async (req, res, next) => {
  try {
    const evento = await Evento.buscarPorId(
      req.params.id
    );

    if (!evento) {
      return res.status(404).render('404', {
        titulo: 'Evento não encontrado'
      });
    }

    if (
      evento.organizador_id !==
      req.session.usuario.id
    ) {
      return res.status(403).render('erro', {
        titulo: 'Acesso negado',
        mensagem:
          'Você não pode excluir este evento.'
      });
    }

    await Evento.excluir(req.params.id);

    return res.redirect(
      '/eventos/meus-eventos'
    );
  } catch (error) {
    next(error);
  }
};