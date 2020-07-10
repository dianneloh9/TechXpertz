const Pool = require('pg').Pool;

const { db_user, db_password, db_host, db_port, db_name } = require('./config');

let config;

if (process.env.DATABASE_URL) {
  const params = url.parse(process.env.DATABASE_URL);
  const auth = params.auth.split(':');

  config = {
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split('/')[1],
    ssl: true
  };
} else {
  config = {
    user: db_user,
    password: db_password,
    host: db_host,
    port: db_port,
    database: db_name,
  }
}

const pool = new Pool(config);

pool.on('error', (err, client) => {
  console.error('Unexpected error on postgres client', err);
  process.exit(-1);
})

module.exports = pool;
