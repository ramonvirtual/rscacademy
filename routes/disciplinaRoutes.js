const express = require('express');
const router = express.Router();

const Disciplina = require('../modules/academico/models/Disciplina');
const Turma = require('../modules/academico/models/Turma');
const { verificarAdmin } = require('../middleware/authMiddleware');

/* =====================================================
   FORM CADASTRAR DISCIPLINA
===================================================== */
router.get('/cadastrar/disciplina', verificarAdmin, async (req, res) => {

    try {
        const turmas = await Turma.listar();
        const professores = await Disciplina.listarProfessores();

        res.render('disciplinaCadastrar', {
            user: req.session.user,
            turmas,
            professores
        });

    } catch (error) {
        res.status(500).render('erro', { message: error.message });
    }
});

/* =====================================================
   CRIAR DISCIPLINA
===================================================== */
router.post('/cadastrar/disciplina', verificarAdmin, async (req, res) => {

    try {
        const { nome, turma_id, professor_id } = req.body;

        await Disciplina.criar(nome, turma_id, professor_id);

        res.redirect('/academico/gerenciar/disciplinas');

    } catch (error) {
        res.status(500).render('erro', { message: error.message });
    }
});

/* =====================================================
   GERENCIAR DISCIPLINAS
===================================================== */
router.get('/gerenciar/disciplinas', verificarAdmin, async (req, res) => {

    try {
        const disciplinas = await Disciplina.listar();

        res.render('disciplinas', {
            user: req.session.user,
            disciplinas
        });

    } catch (error) {
        res.status(500).render('erro', { message: error.message });
    }
});

/* =====================================================
   EDITAR DISCIPLINA
===================================================== */
router.get('/gerenciar/disciplinas/editar/:id', verificarAdmin, async (req, res) => {

    try {
        const disciplina = await Disciplina.buscarPorId(req.params.id);
        const turmas = await Turma.listar();
        const professores = await Disciplina.listarProfessores();

        res.render('disciplinaEditar', {
            user: req.session.user,
            disciplina,
            turmas,
            professores
        });

    } catch (error) {
        res.status(500).render('erro', { message: error.message });
    }
});

/* =====================================================
   ATUALIZAR DISCIPLINA
===================================================== */
router.post('/gerenciar/disciplinas/editar/:id', verificarAdmin, async (req, res) => {

    try {
        const { nome, turma_id, professor_id } = req.body;

        await Disciplina.atualizar(req.params.id, nome, turma_id, professor_id);

        res.redirect('/academico/gerenciar/disciplinas');

    } catch (error) {
        res.status(500).render('erro', { message: error.message });
    }
});

/* =====================================================
   EXCLUIR DISCIPLINA
===================================================== */
router.get('/gerenciar/disciplinas/excluir/:id', verificarAdmin, async (req, res) => {

    try {
        await Disciplina.excluir(req.params.id);

        res.redirect('/academico/gerenciar/disciplinas');

    } catch (error) {
        res.status(500).render('erro', { message: error.message });
    }
});

module.exports = router;