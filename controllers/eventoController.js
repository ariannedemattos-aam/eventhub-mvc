const { validationResult } = require('express-validator');

const Evento = require('../models/Evento');

/**
 * Lista os eventos disponíveis.
 *
 * Busca os eventos no banco de dados e renderiza
 * a página principal de descoberta de eventos.
 *
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
exports.listar = async (req, res, next) => {
  try {
    const eventos = await Evento.listarTodos();

    res.render('eventos/index', {
      titulo: 'Eventos',
      eventos
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lista os eventos criados pelo usuário autenticado.
 *
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
exports.meusEventos = async (req, res, next) => {
  try {
    const eventos = await Evento.listarPorUsuario(
      req.session.usuario.id
    );

    res.render('eventos/meus-eventos', {
      titulo: 'Meus eventos',
      eventos
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Exibe os detalhes de um evento específico.
 *
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
exports.detalhes = async (req, res, next) => {
  try {
    const evento = await Evento.buscarPorId(req.params.id);

    if (!evento) {
      return res.status(404).render('404', {
        titulo: 'Evento não encontrado'
      });
    }

    res.render('eventos/detalhes', {
      titulo: evento.titulo,
      evento
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Exibe o formulário de criação de evento.
 *
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
exports.exibirCriacao = async (req, res, next) => {
  try {
    res.render('eventos/criar', {
      titulo: 'Criar evento',
      erros: [],
      dados: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cria um novo evento.
 *
 * Valida os dados enviados pelo formulário e associa
 * o evento ao usuário autenticado que o criou.
 *
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
exports.criar = async (req, res, next) => {
  try {
    const erros = validationResult(req);

    if (!erros.isEmpty()) {
      return res.status(400).render('eventos/criar', {
        titulo: 'Criar evento',
        erros: erros.array(),
        dados: req.body
      });
    }

    const {
      titulo,
      descricao,
      data,
      local
    } = req.body;

    await Evento.criar({
      titulo,
      descricao,
      data,
      local,
      organizadorId: req.session.usuario.id
    });

    res.redirect('/eventos/meus-eventos');
  } catch (error) {
    next(error);
  }
};

/**
 * Exibe o formulário de edição de um evento.
 *
 * Verifica se o evento existe e se pertence ao usuário
 * autenticado que o criou antes de permitir a edição.
 *
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
exports.exibirEdicao = async (req, res, next) => {
  try {
    const evento = await Evento.buscarPorId(req.params.id);

    if (!evento) {
      return res.status(404).render('404', {
        titulo: 'Evento não encontrado'
      });
    }

    if (evento.organizador_id !== req.session.usuario.id) {
      return res.status(403).render('erro', {
        titulo: 'Acesso negado',
        mensagem: 'Você não pode editar este evento.'
      });
    }

    res.render('eventos/editar', {
      titulo: 'Editar evento',
      evento,
      erros: []
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Atualiza os dados de um evento existente.
 *
 * Valida os novos dados e verifica se o evento pertence
 * ao usuário autenticado antes de realizar a atualização.
 *
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
exports.atualizar = async (req, res, next) => {
  try {
    const erros = validationResult(req);
    const evento = await Evento.buscarPorId(req.params.id);

    if (!evento) {
      return res.status(404).render('404', {
        titulo: 'Evento não encontrado'
      });
    }

    if (evento.organizador_id !== req.session.usuario.id) {
      return res.status(403).render('erro', {
        titulo: 'Acesso negado',
        mensagem: 'Você não pode editar este evento.'
      });
    }

    if (!erros.isEmpty()) {
      return res.status(400).render('eventos/editar', {
        titulo: 'Editar evento',
        evento: {
          ...evento,
          ...req.body
        },
        erros: erros.array()
      });
    }

    const {
      titulo,
      descricao,
      data,
      local
    } = req.body;

    await Evento.atualizar(req.params.id, {
      titulo,
      descricao,
      data,
      local
    });

    res.redirect(`/eventos/${req.params.id}`);
  } catch (error) {
    next(error);
  }
};

/**
 * Exclui um evento.
 *
 * Verifica se o evento existe e se pertence ao usuário
 * autenticado que o criou antes de removê-lo do banco.
 *
 * @async
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
exports.excluir = async (req, res, next) => {
  try {
    const evento = await Evento.buscarPorId(req.params.id);

    if (!evento) {
      return res.status(404).render('404', {
        titulo: 'Evento não encontrado'
      });
    }

    if (evento.organizador_id !== req.session.usuario.id) {
      return res.status(403).render('erro', {
        titulo: 'Acesso negado',
        mensagem: 'Você não pode excluir este evento.'
      });
    }

    await Evento.excluir(req.params.id);


    res.redirect('/eventos/meus-eventos');
  } catch (error) {
    next(error);
  }
};