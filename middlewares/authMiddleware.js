/**
 * Garante que o usuário esteja autenticado.
 *
 * Protege rotas que exigem uma conta ativa.
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