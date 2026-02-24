const db = require('../../../config/db');

class Avaliacao {

    /* ==========================
       LISTAR POR DISCIPLINA
    ========================== */
    static async listarPorDisciplina(disciplina_id) {

        const [rows] = await db.query(`
            SELECT id, titulo, peso, criado_em
            FROM avaliacoes
            WHERE disciplina_id = ?
            ORDER BY id
        `, [disciplina_id]);

        return rows;
    }

    /* ==========================
       BUSCAR POR ID
    ========================== */
    static async buscarPorId(id) {

        const [rows] = await db.query(`
            SELECT * FROM avaliacoes WHERE id = ?
        `, [id]);

        return rows[0];
    }

    /* ==========================
       VERIFICAR DUPLICIDADE
    ========================== */
    static async existeTitulo(disciplina_id, titulo) {

        const [rows] = await db.query(`
            SELECT id FROM avaliacoes
            WHERE disciplina_id = ?
            AND titulo = ?
            LIMIT 1
        `, [disciplina_id, titulo]);

        return rows.length > 0;
    }

    /* ==========================
       CRIAR
    ========================== */
    static async criar(disciplina_id, titulo, peso) {

        if (!titulo)
            throw new Error("Título é obrigatório.");

        if (!peso || peso <= 0)
            throw new Error("Peso deve ser maior que zero.");

        const duplicado = await this.existeTitulo(disciplina_id, titulo);

        if (duplicado)
            throw new Error("Já existe uma avaliação com esse título.");

        await db.query(`
            INSERT INTO avaliacoes (disciplina_id, titulo, peso)
            VALUES (?, ?, ?)
        `, [disciplina_id, titulo.trim(), peso]);
    }

    /* ==========================
       ATUALIZAR
    ========================== */
    static async atualizar(id, titulo, peso) {

        if (!titulo)
            throw new Error("Título é obrigatório.");

        if (!peso || peso <= 0)
            throw new Error("Peso deve ser maior que zero.");

        await db.query(`
            UPDATE avaliacoes
            SET titulo = ?, peso = ?
            WHERE id = ?
        `, [titulo.trim(), peso, id]);
    }

    /* ==========================
       EXCLUIR
    ========================== */
    static async excluir(id) {

        await db.query(`
            DELETE FROM avaliacoes
            WHERE id = ?
        `, [id]);
    }

}

module.exports = Avaliacao;