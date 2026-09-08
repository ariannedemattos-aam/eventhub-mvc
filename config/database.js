const mysql = require('mysql2/promise');

const config = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

/*
 * O Aiven exige conexão SSL em produção.
 * No ambiente local, a conexão pode ser feita sem SSL.
 */
if (process.env.NODE_ENV === 'production') {
  config.ssl = {
    rejectUnauthorized: false
  };
}

const pool = mysql.createPool(config);

module.exports = pool;