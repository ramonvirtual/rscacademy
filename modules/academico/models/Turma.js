const db = require('../../../config/db');

class Turma {

    /* ==========================
       LISTAR TURMAS
    ========================== */
    static async listar() {
        const [rows] = await db.query(
            `SELECT t.id,
                    t.nome,
                    c.nome AS curso,
                    t.criado_em
             FROM turmas t
             JOIN cursos c ON t.curso_id = c.id
             ORDER BY t.id DESC`
        );
        return rows;
    }

    /* ==========================
       LISTAR CURSOS (para dropdown)
    ========================== */
    static async listarCursos() {
        const [rows] = await db.query(
            "SELECT id, nome FROM cursos ORDER BY nome"
        );
        return rows;
    }

    /* ==========================
       BUSCAR POR ID
    ========================== */
    static async buscarPorId(id) {
        const [rows] = await db.query(
            "SELECT * FROM turmas WHERE id=?",
            [id]
        );
        return rows[0];
    }

    /* ==========================
       CRIAR TURMA
    ========================== */
    static async criar(nome, curso_id) {
        if (!nome) throw new Error("Nome obrigatório.");

        await db.query(
            "INSERT INTO turmas (nome, curso_id) VALUES (?,?)",
            [nome.trim(), curso_id]
        );
    }

    /* ==========================
       ATUALIZAR TURMA
    ========================== */
    static async atualizar(id, nome, curso_id) {
        await db.query(
            "UPDATE turmas SET nome=?, curso_id=? WHERE id=?",
            [nome.trim(), curso_id, id]
        );
    }

    /* ==========================
       VERIFICAR DISCIPLINAS
    ========================== */
    static async possuiDisciplinas(id) {
        const [rows] = await db.query(
            "SELECT COUNT(*) AS total FROM disciplinas WHERE turma_id=?",
            [id]
        );
        return rows[0].total > 0;
    }

    /* ==========================
       EXCLUIR TURMA
    ========================== */
    static async excluir(id) {

        const temDisciplinas = await this.possuiDisciplinas(id);

        if (temDisciplinas) {
            throw new Error("Não pode excluir. Existem disciplinas vinculadas.");
        }

        await db.query(
            "DELETE FROM turmas WHERE id=?",
            [id]
        );
    }
}

module.exports = Turma;