const Inscricao = require('../models/Inscricao');
const Evento = require('../models/Evento');

exports.inscrever = async (req, res, next) => {
  try {
    const usuarioId = req.session.usuario.id;
    const eventoId = Number(req.params.id);

    const evento = await Evento.buscarPorId(eventoId);

    if (!evento) {
      return res.status(404).render('404', {
        titulo: 'Evento não encontrado'
      });
    }

    if (evento.organizador_id === usuarioId) {
      return res.status(403).render('erro', {
        titulo: 'Inscrição não permitida',
        mensagem: 'Você não pode se inscrever no próprio evento.'
      });
    }

    if (evento.tipo_ingresso !== 'gratuito') {
      return res.status(400).render('erro', {
        titulo: 'Inscrição externa',
        mensagem:
          'Este evento utiliza venda de ingressos em uma plataforma externa.'
      });
    }

    if (new Date(evento.data) < new Date()) {
      return res.status(400).render('erro', {
        titulo: 'Evento encerrado',
        mensagem: 'Não é mais possível se inscrever neste evento.'
      });
    }

    const resultado =
      await Inscricao.criarComControleDeVagas({
        usuarioId,
        eventoId
      });

    if (resultado === 'duplicada') {
      return res.status(409).render('erro', {
        titulo: 'Inscrição já realizada',
        mensagem: 'Você já está inscrito neste evento.'
      });
    }

    if (resultado === 'esgotado') {
      return res.status(409).render('erro', {
        titulo: 'Evento esgotado',
        mensagem: 'Não há mais vagas disponíveis para este evento.'
      });
    }

    return res.redirect('/minhas-inscricoes');

  } catch (error) {
    next(error);
  }
};

exports.minhasInscricoes = async (req, res, next) => {
  try {
    const inscricoes = await Inscricao.listarPorUsuario(
      req.session.usuario.id
    );

    const agora = new Date();

    const proximas = inscricoes.filter(
      (inscricao) => new Date(inscricao.data) >= agora
    );

    const anteriores = inscricoes.filter(
      (inscricao) => new Date(inscricao.data) < agora
    );

    res.render('minhas-inscricoes', {
      titulo: 'Minhas inscrições',
      proximas,
      anteriores
    });

  } catch (error) {
    next(error);
  }
};

exports.cancelar = async (req, res, next) => {
  try {
    const inscricao = await Inscricao.buscarPorId(
      req.params.id
    );

    if (!inscricao) {
      return res.status(404).render('404', {
        titulo: 'Inscrição não encontrada'
      });
    }

    if (inscricao.usuario_id !== req.session.usuario.id) {
      return res.status(403).render('erro', {
        titulo: 'Acesso negado',
        mensagem: 'Você não pode cancelar esta inscrição.'
      });
    }

    await Inscricao.excluir(req.params.id);

    return res.redirect('/minhas-inscricoes');

  } catch (error) {
    next(error);
  }
};