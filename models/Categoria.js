const pool = require('../config/database');

exports.listarTodas = async () => {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        nome,
        slug
      FROM categorias
      ORDER BY nome ASC
    `
  );

  return rows;
};

exports.buscarPorId = async (id) => {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        nome,
        slug
      FROM categorias
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};