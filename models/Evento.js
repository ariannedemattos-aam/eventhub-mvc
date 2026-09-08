const pool = require('../config/database');

const selectBase = `
  SELECT
    eventos.*,
    usuarios.nome AS organizador_nome,
    usuarios.foto_url AS organizador_foto,
    categorias.nome AS categoria_nome,
    categorias.slug AS categoria_slug,

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
          WHERE inscricoes.evento_id = eventos.id
        ),
        0
      )
      ELSE NULL
    END AS vagas_restantes

  FROM eventos

  INNER JOIN usuarios
    ON usuarios.id = eventos.organizador_id

  INNER JOIN categorias
    ON categorias.id = eventos.categoria_id
`;

exports.listarDisponiveis = async ({
  busca = '',
  categoriaId = '',
  local = '',
  periodo = '',
  tipoIngresso = ''
} = {}) => {
  const condicoes = [
    'eventos.data >= CURDATE()'
  ];

  const parametros = [];

  if (busca) {
    condicoes.push(
      '(eventos.titulo LIKE ? OR eventos.descricao LIKE ?)'
    );

    const termo = `%${busca}%`;

    parametros.push(
      termo,
      termo
    );
  }

  if (categoriaId) {
    condicoes.push('eventos.categoria_id = ?');
    parametros.push(categoriaId);
  }

  if (local) {
    condicoes.push('eventos.local LIKE ?');
    parametros.push(`%${local}%`);
  }

  if (tipoIngresso) {
    condicoes.push('eventos.tipo_ingresso = ?');
    parametros.push(tipoIngresso);
  }

  if (periodo === 'hoje') {
    condicoes.push('eventos.data = CURDATE()');
  }

  if (periodo === 'fim-de-semana') {
    condicoes.push(`
      eventos.data BETWEEN
        DATE_ADD(
          CURDATE(),
          INTERVAL (
            CASE
              WHEN WEEKDAY(CURDATE()) <= 5
              THEN 5 - WEEKDAY(CURDATE())
              ELSE 0
            END
          ) DAY
        )
        AND
        DATE_ADD(
          CURDATE(),
          INTERVAL (
            CASE
              WHEN WEEKDAY(CURDATE()) <= 5
              THEN 6 - WEEKDAY(CURDATE())
              ELSE 6 - WEEKDAY(CURDATE()) + 7
            END
          ) DAY
        )
    `);
  }

  if (periodo === 'proximos') {
    condicoes.push(`
      eventos.data BETWEEN
        CURDATE()
        AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
    `);
  }

  const [rows] = await pool.execute(
    `
      ${selectBase}
      WHERE ${condicoes.join(' AND ')}
      ORDER BY eventos.data ASC
    `,
    parametros
  );

  return rows;
};

exports.listarPorUsuario = async (usuarioId) => {
  const [rows] = await pool.execute(
    `
      ${selectBase}
      WHERE eventos.organizador_id = ?
      ORDER BY eventos.data ASC
    `,
    [usuarioId]
  );

  return rows;
};

exports.listarRecomendados = async (usuarioId) => {
  const [rows] = await pool.execute(
    `
      ${selectBase}

      INNER JOIN usuario_interesses
        ON usuario_interesses.categoria_id =
           eventos.categoria_id

      WHERE usuario_interesses.usuario_id = ?
        AND eventos.organizador_id <> ?
        AND eventos.data >= CURDATE()

      ORDER BY
        eventos.data ASC,
        eventos.criado_em DESC
    `,
    [
      usuarioId,
      usuarioId
    ]
  );

  return rows;
};

exports.buscarPorId = async (id) => {
  const [rows] = await pool.execute(
    `
      ${selectBase}
      WHERE eventos.id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

exports.criar = async ({
  titulo,
  descricao,
  data,
  local,
  categoriaId,
  imagemUrl,
  tipoIngresso,
  preco,
  linkIngresso,
  cupom,
  vagas,
  organizadorId
}) => {
  const [resultado] = await pool.execute(
    `
      INSERT INTO eventos (
        titulo,
        descricao,
        data,
        local,
        categoria_id,
        imagem_url,
        tipo_ingresso,
        preco,
        link_ingresso,
        cupom,
        vagas,
        organizador_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      titulo,
      descricao,
      data,
      local,
      categoriaId,
      imagemUrl,
      tipoIngresso,
      preco,
      linkIngresso,
      cupom,
      vagas,
      organizadorId
    ]
  );

  return resultado.insertId;
};

exports.atualizar = async (
  id,
  {
    titulo,
    descricao,
    data,
    local,
    categoriaId,
    imagemUrl,
    tipoIngresso,
    preco,
    linkIngresso,
    cupom,
    vagas
  }
) => {
  const [resultado] = await pool.execute(
    `
      UPDATE eventos
      SET
        titulo = ?,
        descricao = ?,
        data = ?,
        local = ?,
        categoria_id = ?,
        imagem_url = ?,
        tipo_ingresso = ?,
        preco = ?,
        link_ingresso = ?,
        cupom = ?,
        vagas = ?
      WHERE id = ?
    `,
    [
      titulo,
      descricao,
      data,
      local,
      categoriaId,
      imagemUrl,
      tipoIngresso,
      preco,
      linkIngresso,
      cupom,
      vagas,
      id
    ]
  );

  return resultado.affectedRows > 0;
};

exports.excluir = async (id) => {
  const [resultado] = await pool.execute(
    `
      DELETE FROM eventos
      WHERE id = ?
    `,
    [id]
  );

  return resultado.affectedRows > 0;
};