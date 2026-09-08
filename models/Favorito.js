const pool = require('../config/database');

exports.buscarPorUsuarioEEvento = async (
  usuarioId,
  eventoId
) => {
  const [rows] = await pool.execute(
    `
      SELECT *
      FROM favoritos
      WHERE usuario_id = ?
        AND evento_id = ?
      LIMIT 1
    `,
    [
      usuarioId,
      eventoId
    ]
  );

  return rows[0] || null;
};

exports.criar = async ({
  usuarioId,
  eventoId
}) => {
  await pool.execute(
    `
      INSERT INTO favoritos
        (usuario_id, evento_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE
        usuario_id = VALUES(usuario_id)
    `,
    [
      usuarioId,
      eventoId
    ]
  );

  return true;
};

exports.excluirPorUsuarioEEvento = async (
  usuarioId,
  eventoId
) => {
  const [resultado] = await pool.execute(
    `
      DELETE FROM favoritos
      WHERE usuario_id = ?
        AND evento_id = ?
    `,
    [
      usuarioId,
      eventoId
    ]
  );

  return resultado.affectedRows > 0;
};

exports.listarPorUsuario = async (usuarioId) => {
  const [rows] = await pool.execute(
    `
      SELECT
        favoritos.id AS favorito_id,
        favoritos.criado_em AS favoritado_em,

        eventos.*,

        categorias.nome AS categoria_nome,
        categorias.slug AS categoria_slug,

        usuarios.id AS organizador_id,
        usuarios.nome AS organizador_nome,

        (
          SELECT COUNT(*)
          FROM inscricoes
          WHERE inscricoes.evento_id = eventos.id
        ) AS total_inscritos,

        CASE
          WHEN eventos.tipo_ingresso = 'gratuito'
            AND eventos.vagas IS NOT NULL
          THEN GREATEST(
            eventos.vagas - (
              SELECT COUNT(*)
              FROM inscricoes
              WHERE inscricoes.evento_id =
                    eventos.id
            ),
            0
          )
          ELSE NULL
        END AS vagas_restantes

      FROM favoritos

      INNER JOIN eventos
        ON eventos.id = favoritos.evento_id

      INNER JOIN categorias
        ON categorias.id = eventos.categoria_id

      INNER JOIN usuarios
        ON usuarios.id = eventos.organizador_id

      WHERE favoritos.usuario_id = ?

      ORDER BY eventos.data ASC
    `,
    [usuarioId]
  );

  return rows;
};