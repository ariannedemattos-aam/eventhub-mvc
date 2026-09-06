const pool = require('../config/database');

/**
 * Lista todos os eventos.
 *
 * @async
 * @returns {Promise<Array>}
 */
exports.listarTodos = async () => {
  const [rows] = await pool.execute(`
    SELECT
      eventos.*,
      usuarios.nome AS organizador_nome
    FROM eventos
    INNER JOIN usuarios
      ON usuarios.id = eventos.organizador_id
    ORDER BY eventos.data ASC
  `);

  return rows;
};

/**
 * Lista os eventos criados por um usuário.
 *
 * @async
 * @param {number|string} usuarioId
 * @returns {Promise<Array>}
 */
exports.listarPorUsuario = async (usuarioId) => {
  const [rows] = await pool.execute(
    `
      SELECT
        eventos.*,
        usuarios.nome AS organizador_nome
      FROM eventos
      INNER JOIN usuarios
        ON usuarios.id = eventos.organizador_id
      WHERE eventos.organizador_id = ?
      ORDER BY eventos.data ASC
    `,
    [usuarioId]
  );

  return rows;
};

/**
 * Busca um evento pelo ID.
 *
 * @async
 * @param {number|string} id
 * @returns {Promise<Object|null>}
 */
exports.buscarPorId = async (id) => {
  const [rows] = await pool.execute(
    `
      SELECT
        eventos.*,
        usuarios.nome AS organizador_nome
      FROM eventos
      INNER JOIN usuarios
        ON usuarios.id = eventos.organizador_id
      WHERE eventos.id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

/**
 * Cria um novo evento.
 *
 * @async
 * @param {Object} evento
 * @param {string} evento.titulo
 * @param {string} evento.descricao
 * @param {string} evento.data
 * @param {string} evento.local
 * @param {number} evento.organizadorId
 * @returns {Promise<number>}
 */
exports.criar = async ({
  titulo,
  descricao,
  data,
  local,
  organizadorId
}) => {
  const [resultado] = await pool.execute(
    `
      INSERT INTO eventos
        (titulo, descricao, data, local, organizador_id)
      VALUES (?, ?, ?, ?, ?)
    `,
    [titulo, descricao, data, local, organizadorId]
  );

  return resultado.insertId;
};

/**
 * Atualiza um evento.
 *
 * @async
 * @param {number|string} id
 * @param {Object} evento
 * @param {string} evento.titulo
 * @param {string} evento.descricao
 * @param {string} evento.data
 * @param {string} evento.local
 * @returns {Promise<boolean>}
 */
exports.atualizar = async (
  id,
  {
    titulo,
    descricao,
    data,
    local
  }
) => {
  const [resultado] = await pool.execute(
    `
      UPDATE eventos
      SET titulo = ?,
          descricao = ?,
          data = ?,
          local = ?
      WHERE id = ?
    `,
    [titulo, descricao, data, local, id]
  );

  return resultado.affectedRows > 0;
};

/**
 * Exclui um evento.
 *
 * @async
 * @param {number|string} id
 * @returns {Promise<boolean>}
 */
exports.excluir = async (id) => {
  const [resultado] = await pool.execute(
    'DELETE FROM eventos WHERE id = ?',
    [id]
  );

  return resultado.affectedRows > 0;
};