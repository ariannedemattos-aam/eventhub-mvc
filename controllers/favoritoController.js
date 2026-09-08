const Evento = require('../models/Evento');
const Favorito = require('../models/Favorito');

exports.listar = async (req, res, next) => {
  try {
    const favoritos = await Favorito.listarPorUsuario(
      req.session.usuario.id
    );

    res.render('favoritos/index', {
      titulo: 'Meus favoritos',
      favoritos
    });

  } catch (error) {
    next(error);
  }
};

exports.adicionar = async (req, res, next) => {
  try {
    const usuarioId = req.session.usuario.id;
    const eventoId = Number(req.params.id);

    const evento = await Evento.buscarPorId(eventoId);

    if (!evento) {
      return res.status(404).render('404', {
        titulo: 'Evento não encontrado'
      });
    }

    await Favorito.criar({
      usuarioId,
      eventoId
    });

    return res.redirect(`/eventos/${eventoId}`);

  } catch (error) {
    next(error);
  }
};

exports.remover = async (req, res, next) => {
  try {
    const usuarioId = req.session.usuario.id;
    const eventoId = Number(req.params.id);

    await Favorito.excluirPorUsuarioEEvento(
      usuarioId,
      eventoId
    );

    const retorno = req.get('referer');

    if (
      retorno &&
      retorno.includes('/favoritos')
    ) {
      return res.redirect('/favoritos');
    }

    return res.redirect(`/eventos/${eventoId}`);

  } catch (error) {
    next(error);
  }
};