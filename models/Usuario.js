const pool = require('../config/database');

/**
 * Busca um usuário pelo e-mail.
 *
 * @async
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
exports.buscarPorEmail = async (email) => {
  const [rows] = await pool.execute(
    'SELECT * FROM usuarios WHERE email = ? LIMIT 1',
    [email]
  );

  return rows[0] || null;
};

/**
 * Cria um novo usuário.
 *
 * @async
 * @param {Object} usuario
 * @param {string} usuario.nome
 * @param {string} usuario.email
 * @param {string} usuario.senha
 * @returns {Promise<number>}
 */
exports.criar = async ({ nome, email, senha }) => {
  const [resultado] = await pool.execute(
    `
      INSERT INTO usuarios (nome, email, senha)
      VALUES (?, ?, ?)
    `,
    [nome, email, senha]
  );

  return resultado.insertId;
};