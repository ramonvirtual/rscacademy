const db = require('../../../config/db');

class Curso {

    /* ==========================
       LISTAR TODOS
    ========================== */
    static async listar() {
        const [rows] = await db.query(
            "SELECT id, nome, descricao, criado_em FROM cursos ORDER BY id DESC"
        );
        return rows;
    }

    /* ==========================
       BUSCAR POR ID
    ========================== */
    static async buscarPorId(id) {

        if (!id) throw new Error("ID inválido.");

        const [rows] = await db.query(
            "SELECT * FROM cursos WHERE id = ?",
            [id]
        );

        return rows[0];
    }

    /* ==========================
       CRIAR
    ========================== */
    static async criar(nome, descricao) {

        if (!nome || nome.trim() === '') {
            throw new Error("Nome do curso é obrigatório.");
        }

        await db.query(
            "INSERT INTO cursos (nome, descricao) VALUES (?, ?)",
            [nome.trim(), descricao?.trim() || null]
        );
    }

    /* ==========================
       ATUALIZAR
    ========================== */
    static async atualizar(id, nome, descricao) {

        if (!id) throw new Error("ID inválido.");
        if (!nome || nome.trim() === '') {
            throw new Error("Nome do curso é obrigatório.");
        }

        await db.query(
            "UPDATE cursos SET nome=?, descricao=? WHERE id=?",
            [nome.trim(), descricao?.trim() || null, id]
        );
    }

    /* ==========================
       VERIFICAR SE POSSUI TURMAS
    ========================== */
    static async possuiTurmas(id) {

        const [rows] = await db.query(
            "SELECT COUNT(*) AS total FROM turmas WHERE curso_id=?",
            [id]
        );

        return rows[0].total > 0;
    }

    /* ==========================
       EXCLUIR
    ========================== */
    static async excluir(id) {

        const temTurmas = await this.possuiTurmas(id);

        if (temTurmas) {
            throw new Error("Não é possível excluir. Existem turmas vinculadas.");
        }

        await db.query(
            "DELETE FROM cursos WHERE id=?",
            [id]
        );
    }
}

module.exports = Curso;