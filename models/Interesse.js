const pool = require('../config/database');

exports.listarPorUsuario = async (usuarioId) => {
  const [rows] = await pool.execute(
    `
      SELECT
        usuario_interesses.id,
        usuario_interesses.usuario_id,
        usuario_interesses.categoria_id,
        categorias.nome AS categoria_nome,
        categorias.slug AS categoria_slug

      FROM usuario_interesses

      INNER JOIN categorias
        ON categorias.id =
           usuario_interesses.categoria_id

      WHERE usuario_interesses.usuario_id = ?

      ORDER BY categorias.nome ASC
    `,
    [usuarioId]
  );

  return rows;
};

exports.criar = async ({
  usuarioId,
  categoriaId
}) => {
  await pool.execute(
    `
      INSERT INTO usuario_interesses
        (usuario_id, categoria_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE
        usuario_id = VALUES(usuario_id)
    `,
    [
      usuarioId,
      categoriaId
    ]
  );

  return true;
};

exports.excluirPorUsuarioECategoria = async (
  usuarioId,
  categoriaId
) => {
  const [resultado] = await pool.execute(
    `
      DELETE FROM usuario_interesses
      WHERE usuario_id = ?
        AND categoria_id = ?
    `,
    [
      usuarioId,
      categoriaId
    ]
  );

  return resultado.affectedRows > 0;
};