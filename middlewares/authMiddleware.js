/**
 * Garante que o usuário esteja autenticado.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
exports.autenticado = (req, res, next) => {
  if (!req.session.usuario) {
    return res.redirect('/login');
  }

  next();
};

/**
 * Garante que apenas organizadores acessem a rota.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
exports.organizador = (req, res, next) => {
  if (!req.session.usuario) {
    return res.redirect('/login');
  }

  if (req.session.usuario.tipo !== 'organizador') {
    return res.status(403).render('erro', {
      titulo: 'Acesso negado',
      mensagem: 'Esta área é exclusiva para organizadores.'
    });
  }

  next();
};

/**
 * Garante que apenas participantes acessem a rota.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
exports.participante = (req, res, next) => {
  if (!req.session.usuario) {
    return res.redirect('/login');
  }

  if (req.session.usuario.tipo !== 'participante') {
    return res.status(403).render('erro', {
      titulo: 'Acesso negado',
      mensagem: 'Esta área é exclusiva para participantes.'
    });
  }

  next();
};