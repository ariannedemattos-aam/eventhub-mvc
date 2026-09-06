/**
 * Garante que o usuário esteja autenticado.
 *
 * Este middleware protege rotas que exigem uma conta ativa.
 * Como todos os usuários do EventHub podem criar eventos e
 * participar de eventos de outras pessoas, não há mais
 * separação entre organizador e participante.
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