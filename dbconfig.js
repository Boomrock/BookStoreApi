const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres', // замените на вашего пользователя PostgreSQL
    host: 'localhost',
    database: 'BookStore',
    password: '12344321q', // замените на ваш пароль
    port: 5432, // замените на ваш порт PostgreSQL, по умолчанию 5432
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = pool;
