const pool = require('../config/database');

exports.buscarPorEmail = async (email) => {
  const [rows] = await pool.execute(
    `
      SELECT *
      FROM usuarios
      WHERE email = ?
      LIMIT 1
    `,
    [email]
  );

  return rows[0] || null;
};

exports.buscarPorId = async (id) => {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        nome,
        email,
        foto_url,
        bio,
        cidade,
        site,
        instagram,
        criado_em,
        atualizado_em
      FROM usuarios
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

exports.criar = async ({ nome, email, senha }) => {
  const [resultado] = await pool.execute(
    `
      INSERT INTO usuarios
        (nome, email, senha)
      VALUES (?, ?, ?)
    `,
    [nome, email, senha]
  );

  return resultado.insertId;
};

exports.atualizarPerfil = async (
  id,
  {
    nome,
    fotoUrl,
    bio,
    cidade,
    site,
    instagram
  }
) => {
  const [resultado] = await pool.execute(
    `
      UPDATE usuarios
      SET
        nome = ?,
        foto_url = ?,
        bio = ?,
        cidade = ?,
        site = ?,
        instagram = ?
      WHERE id = ?
    `,
    [
      nome,
      fotoUrl,
      bio,
      cidade,
      site,
      instagram,
      id
    ]
  );

  return resultado.affectedRows > 0;
};

exports.salvarTokenRecuperacao = async (
  id,
  tokenHash,
  expiracao
) => {
  const [resultado] = await pool.execute(
    `
      UPDATE usuarios
      SET
        reset_token_hash = ?,
        reset_token_expira = ?
      WHERE id = ?
    `,
    [tokenHash, expiracao, id]
  );

  return resultado.affectedRows > 0;
};

exports.buscarPorTokenRecuperacao = async (tokenHash) => {
  const [rows] = await pool.execute(
    `
      SELECT *
      FROM usuarios
      WHERE reset_token_hash = ?
        AND reset_token_expira > NOW()
      LIMIT 1
    `,
    [tokenHash]
  );

  return rows[0] || null;
};

exports.redefinirSenha = async (id, senhaHash) => {
  const [resultado] = await pool.execute(
    `
      UPDATE usuarios
      SET
        senha = ?,
        reset_token_hash = NULL,
        reset_token_expira = NULL
      WHERE id = ?
    `,
    [senhaHash, id]
  );

  return resultado.affectedRows > 0;
};