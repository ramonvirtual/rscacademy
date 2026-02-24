const db = require('../../../config/db');

class Nota {

    /* =====================================================
       BUSCAR NOTA ESPECÍFICA
    ===================================================== */
    static async buscar(aluno_id, avaliacao_id) {

        const [rows] = await db.query(`
            SELECT *
            FROM notas
            WHERE aluno_id = ?
            AND avaliacao_id = ?
            LIMIT 1
        `, [aluno_id, avaliacao_id]);

        return rows[0];
    }

    /* =====================================================
       SALVAR (INSERT OU UPDATE)
    ===================================================== */
    static async salvar(aluno_id, avaliacao_id, nota) {

        if (!aluno_id || !avaliacao_id)
            throw new Error("Aluno e avaliação são obrigatórios.");

        const valor = parseFloat(nota);

        if (isNaN(valor) || valor < 0 || valor > 10)
            throw new Error("Nota deve estar entre 0 e 10.");

        const existe = await this.buscar(aluno_id, avaliacao_id);

        if (existe) {

            await db.query(`
                UPDATE notas
                SET nota = ?
                WHERE aluno_id = ?
                AND avaliacao_id = ?
            `, [valor, aluno_id, avaliacao_id]);

        } else {

            await db.query(`
                INSERT INTO notas (aluno_id, avaliacao_id, nota)
                VALUES (?, ?, ?)
            `, [aluno_id, avaliacao_id, valor]);

        }
    }

    /* =====================================================
       LISTAR NOTAS POR AVALIAÇÃO
    ===================================================== */
    static async listarPorAvaliacao(avaliacao_id) {

        const [rows] = await db.query(`
            SELECT u.id AS aluno_id,
                   u.nome,
                   u.matricula,
                   n.nota
            FROM avaliacoes a
            JOIN disciplinas d ON a.disciplina_id = d.id
            JOIN matriculas m ON m.turma_id = d.turma_id
            JOIN users u ON m.aluno_id = u.id
            LEFT JOIN notas n 
                ON n.aluno_id = u.id 
                AND n.avaliacao_id = a.id
            WHERE a.id = ?
            ORDER BY u.nome
        `, [avaliacao_id]);

        return rows;
    }

    /* =====================================================
       DIÁRIO COMPLETO DA DISCIPLINA
    ===================================================== */
    static async diarioCompleto(disciplina_id) {

        if (!disciplina_id)
            throw new Error("Disciplina inválida.");

        const [avaliacoes] = await db.query(`
            SELECT id, titulo, peso
            FROM avaliacoes
            WHERE disciplina_id = ?
            ORDER BY id
        `, [disciplina_id]);

        const [alunos] = await db.query(`
            SELECT u.id AS aluno_id,
                   u.nome,
                   u.matricula
            FROM disciplinas d
            JOIN turmas t ON d.turma_id = t.id
            JOIN matriculas m ON m.turma_id = t.id
            JOIN users u ON m.aluno_id = u.id
            WHERE d.id = ?
            ORDER BY u.nome
        `, [disciplina_id]);

        const [notas] = await db.query(`
            SELECT n.aluno_id,
                   n.avaliacao_id,
                   n.nota
            FROM notas n
            JOIN avaliacoes a ON n.avaliacao_id = a.id
            WHERE a.disciplina_id = ?
        `, [disciplina_id]);

        return {
            avaliacoes,
            alunos,
            notas
        };
    }

    /* =====================================================
       LISTAR NOTAS SIMPLES DO ALUNO
    ===================================================== */
    static async listarPorAluno(aluno_id) {

        const [rows] = await db.query(`
            SELECT d.nome AS disciplina,
                   a.titulo AS avaliacao,
                   n.nota
            FROM notas n
            JOIN avaliacoes a ON n.avaliacao_id = a.id
            JOIN disciplinas d ON a.disciplina_id = d.id
            WHERE n.aluno_id = ?
            ORDER BY d.nome
        `, [aluno_id]);

        return rows;
    }

    /* =====================================================
       BOLETIM COMPLETO DO ALUNO
       (CORREÇÃO DEFINITIVA AQUI)
    ===================================================== */
    static async boletimAluno(aluno_id) {

        const [rows] = await db.query(`
            SELECT 
                d.id AS disciplina_id,
                d.nome AS disciplina,
                a.id AS avaliacao_id,
                a.titulo,
                a.peso,
                n.nota
            FROM matriculas m
            JOIN disciplinas d 
                ON d.turma_id = m.turma_id
            LEFT JOIN avaliacoes a 
                ON a.disciplina_id = d.id
            LEFT JOIN notas n 
                ON n.avaliacao_id = a.id 
                AND n.aluno_id = m.aluno_id
            WHERE m.aluno_id = ?
            ORDER BY d.nome, a.id
        `, [aluno_id]);

        return rows;
    }

}

module.exports = Nota;