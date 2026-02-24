const db = require('../../../config/db');

class Matricula {

    /* ==========================
       LISTAR MATRÍCULAS
    ========================== */
    static async listar() {

        const [rows] = await db.query(`
            SELECT m.id,
                   u.nome AS aluno,
                   u.matricula,
                   t.nome AS turma,
                   c.nome AS curso
            FROM matriculas m
            JOIN users u ON m.aluno_id = u.id
            JOIN turmas t ON m.turma_id = t.id
            JOIN cursos c ON t.curso_id = c.id
            ORDER BY m.id DESC
        `);

        return rows;
    }

    /* ==========================
       LISTAR ALUNOS
    ========================== */
    static async listarAlunos() {

        const [rows] = await db.query(`
            SELECT id, nome, matricula
            FROM users
            WHERE perfil = 'aluno'
            ORDER BY nome
        `);

        return rows;
    }

    /* ==========================
       LISTAR TURMAS
    ========================== */
    static async listarTurmas() {

        const [rows] = await db.query(`
            SELECT t.id,
                   t.nome,
                   c.nome AS curso
            FROM turmas t
            JOIN cursos c ON t.curso_id = c.id
            ORDER BY t.nome
        `);

        return rows;
    }

    /* ==========================
       VERIFICAR SE JÁ EXISTE
    ========================== */
    static async existe(aluno_id, turma_id) {

        const [rows] = await db.query(
            "SELECT id FROM matriculas WHERE aluno_id = ? AND turma_id = ?",
            [aluno_id, turma_id]
        );

        return rows.length > 0;
    }

    /* ==========================
       CRIAR MATRÍCULA
    ========================== */
    static async criar(aluno_id, turma_id) {

        if (!aluno_id || !turma_id) {
            throw new Error("Aluno e Turma são obrigatórios.");
        }

        const jaExiste = await this.existe(aluno_id, turma_id);

        if (jaExiste) {
            return false; // já existe
        }

        await db.query(
            "INSERT INTO matriculas (aluno_id, turma_id) VALUES (?, ?)",
            [aluno_id, turma_id]
        );

        return true; // criado com sucesso
    }

    /* ==========================
       EXCLUIR MATRÍCULA
    ========================== */
    static async excluir(id) {

        await db.query(
            "DELETE FROM matriculas WHERE id = ?",
            [id]
        );
    }/* ==========================
   BUSCAR TURMA DO ALUNO
========================== */
static async buscarTurmaDoAluno(aluno_id) {

    const [rows] = await db.query(`
        SELECT t.id,
               t.nome AS turma,
               c.nome AS curso
        FROM matriculas m
        JOIN turmas t ON m.turma_id = t.id
        JOIN cursos c ON t.curso_id = c.id
        WHERE m.aluno_id = ?
        LIMIT 1
    `, [aluno_id]);

    return rows[0] || null;
}

/* ==========================
   LISTAR ALUNOS POR TURMA
========================== */
static async listarAlunosPorTurma(turma_id) {

    const [rows] = await db.query(`
        SELECT u.id,
               u.nome,
               u.matricula
        FROM matriculas m
        JOIN users u ON m.aluno_id = u.id
        WHERE m.turma_id = ?
        ORDER BY u.nome
    `, [turma_id]);

    return rows;
}

}


module.exports = Matricula;