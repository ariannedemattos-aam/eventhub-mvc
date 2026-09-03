const { validationResult } = require('express-validator');
const Evento = require('../models/Evento');

/**
 * Lista todos os eventos cadastrados.
 *
 * Busca os eventos no banco de dados e renderiza
 * a página principal de eventos.
 *
 * @async
 * @param {import('express').Request} req - Objeto da requisição HTTP.
 * @param {import('express').Response} res - Objeto da resposta HTTP.
 * @param {import('express').NextFunction} next - Função para encaminhar erros ao middleware global.
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
 * Exibe os detalhes de um evento específico.
 *
 * Busca o evento pelo identificador recebido na URL
 * e renderiza sua página de detalhes.
 *
 * @async
 * @param {import('express').Request} req - Requisição contendo o ID do evento.
 * @param {import('express').Response} res - Objeto da resposta HTTP.
 * @param {import('express').NextFunction} next - Função para encaminhar erros ao middleware global.
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
 * @param {import('express').Request} req - Objeto da requisição HTTP.
 * @param {import('express').Response} res - Objeto da resposta HTTP.
 * @param {import('express').NextFunction} next - Função para encaminhar erros ao middleware global.
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
 * o evento ao organizador autenticado.
 *
 * @async
 * @param {import('express').Request} req - Requisição contendo os dados do evento.
 * @param {import('express').Response} res - Objeto da resposta HTTP.
 * @param {import('express').NextFunction} next - Função para encaminhar erros ao middleware global.
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

    const { titulo, descricao, data, local } = req.body;

    await Evento.criar({
      titulo,
      descricao,
      data,
      local,
      organizadorId: req.session.usuario.id
    });

    res.redirect('/eventos');
  } catch (error) {
    next(error);
  }
};

/**
 * Exibe o formulário de edição de um evento.
 *
 * Verifica se o evento existe e se pertence ao
 * organizador autenticado antes de permitir a edição.
 *
 * @async
 * @param {import('express').Request} req - Requisição contendo o ID do evento.
 * @param {import('express').Response} res - Objeto da resposta HTTP.
 * @param {import('express').NextFunction} next - Função para encaminhar erros ao middleware global.
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
 * Valida os novos dados e verifica se o usuário autenticado
 * é o organizador responsável pelo evento.
 *
 * @async
 * @param {import('express').Request} req - Requisição contendo o ID e os novos dados do evento.
 * @param {import('express').Response} res - Objeto da resposta HTTP.
 * @param {import('express').NextFunction} next - Função para encaminhar erros ao middleware global.
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

    const { titulo, descricao, data, local } = req.body;

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
 * Verifica se o evento existe e se pertence ao
 * organizador autenticado antes de removê-lo do banco.
 *
 * @async
 * @param {import('express').Request} req - Requisição contendo o ID do evento.
 * @param {import('express').Response} res - Objeto da resposta HTTP.
 * @param {import('express').NextFunction} next - Função para encaminhar erros ao middleware global.
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

    res.redirect('/eventos');
  } catch (error) {
    next(error);
  }
};