const Inscricao = require('../models/Inscricao');
const Evento = require('../models/Evento');

/**
 * Inscreve o usuário autenticado em um evento.
 *
 * Verifica se o evento existe, se não pertence ao próprio usuário
 * e se ainda não existe uma inscrição antes de registrar a nova inscrição.
 *
 * @async
 * @param {import('express').Request} req - Requisição contendo o ID do evento.
 * @param {import('express').Response} res - Objeto da resposta HTTP.
 * @param {import('express').NextFunction} next - Função para encaminhar erros ao middleware global.
 * @returns {Promise<void>}
 */
exports.inscrever = async (req, res, next) => {
  try {
    const usuarioId = req.session.usuario.id;
    const eventoId = req.params.id;

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

    const inscricaoExistente = await Inscricao.buscarPorUsuarioEEvento(
      usuarioId,
      eventoId
    );

    if (inscricaoExistente) {
      return res.status(409).render('erro', {
        titulo: 'Inscrição já realizada',
        mensagem: 'Você já está inscrito neste evento.'
      });
    }

    await Inscricao.criar({
      usuarioId,
      eventoId
    });

    res.redirect('/minhas-inscricoes');
  } catch (error) {
    next(error);
  }
};

/**
 * Lista as inscrições do usuário autenticado.
 *
 * Busca no banco de dados todas as inscrições associadas
 * ao usuário presente na sessão.
 *
 * @async
 * @param {import('express').Request} req - Objeto da requisição HTTP.
 * @param {import('express').Response} res - Objeto da resposta HTTP.
 * @param {import('express').NextFunction} next - Função para encaminhar erros ao middleware global.
 * @returns {Promise<void>}
 */
exports.minhasInscricoes = async (req, res, next) => {
  try {
    const inscricoes = await Inscricao.listarPorUsuario(
      req.session.usuario.id
    );

    res.render('minhas-inscricoes', {
      titulo: 'Minhas inscrições',
      inscricoes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancela uma inscrição do usuário autenticado.
 *
 * Verifica se a inscrição existe e se pertence ao usuário
 * atual antes de removê-la do banco de dados.
 *
 * @async
 * @param {import('express').Request} req - Requisição contendo o ID da inscrição.
 * @param {import('express').Response} res - Objeto da resposta HTTP.
 * @param {import('express').NextFunction} next - Função para encaminhar erros ao middleware global.
 * @returns {Promise<void>}
 */
exports.cancelar = async (req, res, next) => {
  try {
    const inscricao = await Inscricao.buscarPorId(req.params.id);

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

    res.redirect('/minhas-inscricoes');
  } catch (error) {
    next(error);
  }
};