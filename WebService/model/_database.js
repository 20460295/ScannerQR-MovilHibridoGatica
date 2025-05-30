const knex = require('knex');
const db = knex({
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'usuarioqr',
        password: '123',
        database: 'scanqr'
    }
})

module.exports = db;