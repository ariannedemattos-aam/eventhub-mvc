const Categoria = require('../models/Categoria');
const Interesse = require('../models/Interesse');
const Evento = require('../models/Evento');

exports.listar = async (req, res, next) => {
  try {
    const usuarioId = req.session.usuario.id;

    const [categorias, interesses] = await Promise.all([
      Categoria.listarTodas(),
      Interesse.listarPorUsuario(usuarioId)
    ]);

    const idsSelecionados = interesses.map(
      (interesse) => interesse.categoria_id
    );

    res.render('interesses/index', {
      titulo: 'Meus interesses',
      categorias,
      idsSelecionados
    });
  } catch (error) {
    next(error);
  }
};

exports.adicionar = async (req, res, next) => {
  try {
    const usuarioId = req.session.usuario.id;
    const categoriaId = Number(req.params.id);

    const categoria = await Categoria.buscarPorId(categoriaId);

    if (!categoria) {
      return res.status(404).render('404', {
        titulo: 'Categoria não encontrada'
      });
    }

    await Interesse.criar({
      usuarioId,
      categoriaId
    });

    return res.redirect('/interesses');
  } catch (error) {
    next(error);
  }
};

exports.remover = async (req, res, next) => {
  try {
    await Interesse.excluirPorUsuarioECategoria(
      req.session.usuario.id,
      Number(req.params.id)
    );

    return res.redirect('/interesses');
  } catch (error) {
    next(error);
  }
};

exports.adicionarPorEvento = async (req, res, next) => {
  try {
    const usuarioId = req.session.usuario.id;
    const eventoId = Number(req.params.id);

    const evento = await Evento.buscarPorId(eventoId);

    if (!evento) {
      return res.status(404).render('404', {
        titulo: 'Evento não encontrado'
      });
    }

    const interesses = await Interesse.listarPorUsuario(usuarioId);

    const jaExiste = interesses.some(
      (interesse) =>
        Number(interesse.categoria_id) ===
        Number(evento.categoria_id)
    );

    if (jaExiste) {
      return res.redirect(
        `/eventos/${eventoId}?interesse=ja-existe`
      );
    }

    await Interesse.criar({
      usuarioId,
      categoriaId: evento.categoria_id
    });

    return res.redirect(
      `/eventos/${eventoId}?interesse=adicionado`
    );
  } catch (error) {
    next(error);
  }
};