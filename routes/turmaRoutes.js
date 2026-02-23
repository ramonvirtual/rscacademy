const express = require('express');
const router = express.Router();

const Turma = require('../modules/academico/models/Turma');
const Curso = require('../modules/academico/models/Curso');
const { verificarAdmin } = require('../middleware/authMiddleware');

/* =====================================================
   FORM CADASTRAR TURMA
===================================================== */
router.get('/cadastrar/turma', verificarAdmin, async (req, res) => {

    const cursos = await Curso.listar();

    res.render('turmaCadastrar', {
        user: req.session.user,
        cursos
    });
});

/* =====================================================
   CRIAR TURMA
===================================================== */
router.post('/cadastrar/turma', verificarAdmin, async (req, res) => {

    try {
        const { nome, curso_id } = req.body;

        await Turma.criar(nome, curso_id);

        res.redirect('/academico/gerenciar/turmas');

    } catch (error) {
        res.send(error.message);
    }
});

/* =====================================================
   LISTAR / GERENCIAR TURMAS
===================================================== */
router.get('/gerenciar/turmas', verificarAdmin, async (req, res) => {

    const turmas = await Turma.listar();

    res.render('turmaGerenciar', {
        user: req.session.user,
        turmas
    });
});

/* =====================================================
   FORM EDITAR TURMA
===================================================== */
router.get('/gerenciar/turmas/editar/:id', verificarAdmin, async (req, res) => {

    const turma = await Turma.buscarPorId(req.params.id);
    const cursos = await Curso.listar();

    if (!turma) {
        return res.send("Turma não encontrada.");
    }

    res.render('turmaEditar', {
        user: req.session.user,
        turma,
        cursos
    });
});

/* =====================================================
   ATUALIZAR TURMA
===================================================== */
router.post('/gerenciar/turmas/editar/:id', verificarAdmin, async (req, res) => {

    try {
        const { nome, curso_id } = req.body;

        await Turma.atualizar(req.params.id, nome, curso_id);

        res.redirect('/academico/gerenciar/turmas');

    } catch (error) {
        res.send(error.message);
    }
});

/* =====================================================
   EXCLUIR TURMA
===================================================== */
router.get('/gerenciar/turmas/excluir/:id', verificarAdmin, async (req, res) => {

    try {
        await Turma.excluir(req.params.id);
        res.redirect('/academico/gerenciar/turmas');
    } catch (error) {
        res.send(error.message);
    }
});

module.exports = router;