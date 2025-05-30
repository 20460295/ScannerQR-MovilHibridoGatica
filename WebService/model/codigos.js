const db = require('./_database');

class codigos {
    static async consultar(options = {}) {
        let query = db('codes');
        if (options.where) {
            query.where(options.where);
        }
        return await query;
    }
    static async consultarPorId(id) {
        return await db('codes').where('id', id);
    }

    static async insertar(data) {
        return await db('codes').insert(data);
    }

    static async actualizarPorId(id, data) {
        return await db('codes').where('id', id).update(data);
    }

    static async eliminarPorId(id) {
        return await db('codes').where('id', id).delete();
    }
}

module.exports = codigos;