const express = require('express');
const router = express.Router();

const Matricula = require('../modules/academico/models/Matricula');
const { verificarAdmin } = require('../middleware/authMiddleware');

/* =====================================================
   FORM CADASTRAR MATRÍCULA
===================================================== */
router.get('/cadastrar/matricula', verificarAdmin, async (req, res) => {

    try {

        const alunos = await Matricula.listarAlunos();
        const turmas = await Matricula.listarTurmas();

        res.render('matriculaCadastrar', {
            user: req.session.user,
            alunos,
            turmas
        });

    } catch (error) {
        console.error("Erro ao carregar formulário de matrícula:", error);
        res.status(500).render('erro', { message: "Erro ao carregar dados." });
    }
});

/* =====================================================
   CRIAR MATRÍCULA (SUPORTA MÚLTIPLOS + EVITA DUPLICADOS)
===================================================== */
router.post('/cadastrar/matricula', verificarAdmin, async (req, res) => {

    try {

        const { aluno_id, turma_id } = req.body;

        if (!aluno_id || !turma_id) {
            throw new Error("Aluno(s) e Turma são obrigatórios.");
        }

        const alunos = Array.isArray(aluno_id) ? aluno_id : [aluno_id];

        let matriculados = 0;
        let duplicados = 0;

        for (const aluno of alunos) {

            const criado = await Matricula.criar(aluno, turma_id);

            if (criado) {
                matriculados++;
            } else {
                duplicados++;
            }
        }

        res.render('sucesso', {
            message: `
                ${matriculados} aluno(s) matriculado(s) com sucesso.
                ${duplicados} já estavam matriculados.
            `
        });

    } catch (error) {
        console.error("Erro ao cadastrar matrícula:", error);
        res.status(500).render('erro', { message: error.message });
    }
});

/* =====================================================
   GERENCIAR MATRÍCULAS
===================================================== */
router.get('/gerenciar/matriculas', verificarAdmin, async (req, res) => {

    try {

        const matriculas = await Matricula.listar();

        res.render('matriculas', {
            user: req.session.user,
            matriculas
        });

    } catch (error) {
        console.error("Erro ao listar matrículas:", error);
        res.status(500).render('erro', { message: "Erro ao carregar matrículas." });
    }
});

/* =====================================================
   EXCLUIR MATRÍCULA
===================================================== */
router.get('/gerenciar/matriculas/excluir/:id', verificarAdmin, async (req, res) => {

    try {

        await Matricula.excluir(req.params.id);

        res.redirect('/academico/gerenciar/matriculas');

    } catch (error) {
        console.error("Erro ao excluir matrícula:", error);
        res.status(500).render('erro', { message: "Erro ao excluir matrícula." });
    }
});

module.exports = router;