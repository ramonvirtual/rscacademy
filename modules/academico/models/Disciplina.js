const db = require('../../../config/db');

class Disciplina {

    /* ==========================
       LISTAR TODAS
    ========================== */
    static async listar() {
        const [rows] = await db.query(
            `SELECT d.id,
                    d.nome,
                    d.turma_id,
                    t.nome AS turma,
                    c.nome AS curso,
                    u.nome AS professor,
                    d.criado_em
             FROM disciplinas d
             JOIN turmas t ON d.turma_id = t.id
             JOIN cursos c ON t.curso_id = c.id
             JOIN users u ON d.professor_id = u.id
             ORDER BY d.id DESC`
        );
        return rows;
    }

    /* ==========================
       LISTAR TURMAS
    ========================== */
    static async listarTurmas() {
        const [rows] = await db.query(
            `SELECT t.id, t.nome, c.nome AS curso
             FROM turmas t
             JOIN cursos c ON t.curso_id = c.id
             ORDER BY c.nome`
        );
        return rows;
    }

    /* ==========================
       LISTAR PROFESSORES
    ========================== */
    static async listarProfessores() {
        const [rows] = await db.query(
            "SELECT id, nome FROM users WHERE perfil='professor' ORDER BY nome"
        );
        return rows;
    }

    /* ==========================
       BUSCAR POR ID
    ========================== */
    static async buscarPorId(id) {
        const [rows] = await db.query(
            "SELECT * FROM disciplinas WHERE id=?",
            [id]
        );
        return rows[0];
    }

    /* ==========================
       CRIAR
    ========================== */
    static async criar(nome, turma_id, professor_id) {

        if (!nome) throw new Error("Nome obrigatório.");

        await db.query(
            "INSERT INTO disciplinas (nome, turma_id, professor_id) VALUES (?,?,?)",
            [nome.trim(), turma_id, professor_id]
        );
    }

    /* ==========================
       ATUALIZAR
    ========================== */
    static async atualizar(id, nome, turma_id, professor_id) {

        if (!nome) throw new Error("Nome obrigatório.");

        await db.query(
            "UPDATE disciplinas SET nome=?, turma_id=?, professor_id=? WHERE id=?",
            [nome.trim(), turma_id, professor_id, id]
        );
    }

    /* ==========================
       EXCLUIR
    ========================== */
    static async excluir(id) {
        await db.query(
            "DELETE FROM disciplinas WHERE id=?",
            [id]
        );
    }

    /* ==========================
       DISCIPLINAS DO PROFESSOR
    ========================== */
    static async listarPorProfessor(professor_id) {

        const [rows] = await db.query(`
            SELECT d.id,
                   d.nome,
                   d.turma_id,
                   t.nome AS turma,
                   c.nome AS curso
            FROM disciplinas d
            JOIN turmas t ON d.turma_id = t.id
            JOIN cursos c ON t.curso_id = c.id
            WHERE d.professor_id = ?
            ORDER BY d.nome
        `, [professor_id]);

        return rows;
    }

    /* ==========================
       VERIFICAR TURMA DO PROFESSOR
    ========================== */
    static async professorTemTurma(professor_id, turma_id) {

        const [rows] = await db.query(`
            SELECT id
            FROM disciplinas
            WHERE professor_id = ?
            AND turma_id = ?
            LIMIT 1
        `, [professor_id, turma_id]);

        return rows.length > 0;
    }

    /* ==========================
       VERIFICAR DISCIPLINA DO PROFESSOR
    ========================== */
    static async professorTemDisciplina(professor_id, disciplina_id) {

        const [rows] = await db.query(`
            SELECT id
            FROM disciplinas
            WHERE professor_id = ?
            AND id = ?
            LIMIT 1
        `, [professor_id, disciplina_id]);

        return rows.length > 0;
    }
}

module.exports = Disciplina;