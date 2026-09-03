const pool = require('../config/database');

/**
 * Cria uma nova inscrição.
 *
 * @async
 * @param {Object} inscricao
 * @param {number} inscricao.usuarioId
 * @param {number|string} inscricao.eventoId
 * @returns {Promise<number>}
 */
exports.criar = async ({ usuarioId, eventoId }) => {
  const [resultado] = await pool.execute(
    `
      INSERT INTO inscricoes (usuario_id, evento_id)
      VALUES (?, ?)
    `,
    [usuarioId, eventoId]
  );

  return resultado.insertId;
};

/**
 * Busca uma inscrição pelo ID.
 *
 * @async
 * @param {number|string} id
 * @returns {Promise<Object|null>}
 */
exports.buscarPorId = async (id) => {
  const [rows] = await pool.execute(
    `
      SELECT *
      FROM inscricoes
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

/**
 * Verifica se o usuário já está inscrito em um evento.
 *
 * @async
 * @param {number} usuarioId
 * @param {number|string} eventoId
 * @returns {Promise<Object|null>}
 */
exports.buscarPorUsuarioEEvento = async (
  usuarioId,
  eventoId
) => {
  const [rows] = await pool.execute(
    `
      SELECT *
      FROM inscricoes
      WHERE usuario_id = ?
        AND evento_id = ?
      LIMIT 1
    `,
    [usuarioId, eventoId]
  );

  return rows[0] || null;
};

/**
 * Lista todas as inscrições de um usuário.
 *
 * @async
 * @param {number} usuarioId
 * @returns {Promise<Array>}
 */
exports.listarPorUsuario = async (usuarioId) => {
  const [rows] = await pool.execute(
    `
      SELECT
        inscricoes.id AS inscricao_id,
        inscricoes.usuario_id,
        inscricoes.evento_id,
        eventos.titulo,
        eventos.descricao,
        eventos.data,
        eventos.local,
        usuarios.nome AS organizador_nome
      FROM inscricoes
      INNER JOIN eventos
        ON eventos.id = inscricoes.evento_id
      INNER JOIN usuarios
        ON usuarios.id = eventos.organizador_id
      WHERE inscricoes.usuario_id = ?
      ORDER BY eventos.data ASC
    `,
    [usuarioId]
  );

  return rows;
};

/**
 * Exclui uma inscrição.
 *
 * @async
 * @param {number|string} id
 * @returns {Promise<boolean>}
 */
exports.excluir = async (id) => {
  const [resultado] = await pool.execute(
    'DELETE FROM inscricoes WHERE id = ?',
    [id]
  );

  return resultado.affectedRows > 0;
};