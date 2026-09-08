const pool = require('../config/database');

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
    [
      usuarioId,
      eventoId
    ]
  );

  return rows[0] || null;
};

exports.criarComControleDeVagas = async ({
  usuarioId,
  eventoId
}) => {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    const [eventos] = await conexao.execute(
      `
        SELECT
          id,
          vagas,
          tipo_ingresso
        FROM eventos
        WHERE id = ?
        FOR UPDATE
      `,
      [eventoId]
    );

    const evento = eventos[0];

    if (!evento) {
      await conexao.rollback();
      return 'inexistente';
    }

    const [inscricoesExistentes] =
      await conexao.execute(
        `
          SELECT id
          FROM inscricoes
          WHERE usuario_id = ?
            AND evento_id = ?
          LIMIT 1
        `,
        [
          usuarioId,
          eventoId
        ]
      );

    if (inscricoesExistentes.length > 0) {
      await conexao.rollback();
      return 'duplicada';
    }

    if (evento.vagas !== null) {
      const [contagem] = await conexao.execute(
        `
          SELECT COUNT(*) AS total
          FROM inscricoes
          WHERE evento_id = ?
        `,
        [eventoId]
      );

      if (
        Number(contagem[0].total) >=
        Number(evento.vagas)
      ) {
        await conexao.rollback();
        return 'esgotado';
      }
    }

    await conexao.execute(
      `
        INSERT INTO inscricoes
          (usuario_id, evento_id)
        VALUES (?, ?)
      `,
      [
        usuarioId,
        eventoId
      ]
    );

    await conexao.commit();

    return 'criada';

  } catch (error) {
    await conexao.rollback();

    if (error.code === 'ER_DUP_ENTRY') {
      return 'duplicada';
    }

    throw error;

  } finally {
    conexao.release();
  }
};

exports.listarPorUsuario = async (usuarioId) => {
  const [rows] = await pool.execute(
    `
      SELECT
        inscricoes.id AS inscricao_id,
        inscricoes.usuario_id,
        inscricoes.evento_id,
        inscricoes.criado_em AS inscrito_em,

        eventos.titulo,
        eventos.descricao,
        eventos.data,
        eventos.local,
        eventos.imagem_url,
        eventos.tipo_ingresso,
        eventos.preco,
        eventos.vagas,

        categorias.id AS categoria_id,
        categorias.nome AS categoria_nome,

        usuarios.id AS organizador_id,
        usuarios.nome AS organizador_nome

      FROM inscricoes

      INNER JOIN eventos
        ON eventos.id = inscricoes.evento_id

      INNER JOIN categorias
        ON categorias.id = eventos.categoria_id

      INNER JOIN usuarios
        ON usuarios.id = eventos.organizador_id

      WHERE inscricoes.usuario_id = ?

      ORDER BY eventos.data ASC
    `,
    [usuarioId]
  );

  return rows;
};

exports.excluir = async (id) => {
  const [resultado] = await pool.execute(
    `
      DELETE FROM inscricoes
      WHERE id = ?
    `,
    [id]
  );

  return resultado.affectedRows > 0;
};