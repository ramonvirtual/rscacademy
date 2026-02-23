const express = require('express');
const router = express.Router();

const Curso = require('../modules/academico/models/Curso');
const { verificarAdmin } = require('../middleware/authMiddleware');

/* ==========================
   FORM CADASTRO
========================== */
router.get('/cadastrar/curso', verificarAdmin, (req, res) => {
    res.render('cursoCadastrar', { user: req.session.user });
});

/* ==========================
   CRIAR
========================== */
router.post('/cadastrar/curso', verificarAdmin, async (req, res) => {

    try {
        const { nome, descricao } = req.body;
        await Curso.criar(nome, descricao);
        res.redirect('/academico/gerenciar/cursos');
    } catch (error) {
        res.send(error.message);
    }
});

/* ==========================
   LISTAR (GERENCIAR)
========================== */
router.get('/gerenciar/cursos', verificarAdmin, async (req, res) => {

    const cursos = await Curso.listar();

    res.render('cursoGerenciar', {
        user: req.session.user,
        cursos
    });
});

/* ==========================
   EDITAR
========================== */
router.get('/gerenciar/cursos/editar/:id', verificarAdmin, async (req, res) => {

    const curso = await Curso.buscarPorId(req.params.id);
    res.render('cursoEditar', { user: req.session.user, curso });
});

/* ==========================
   ATUALIZAR
========================== */
router.post('/gerenciar/cursos/editar/:id', verificarAdmin, async (req, res) => {

    const { nome, descricao } = req.body;
    await Curso.atualizar(req.params.id, nome, descricao);
    res.redirect('/academico/gerenciar/cursos');
});

/* ==========================
   EXCLUIR
========================== */
router.get('/gerenciar/cursos/excluir/:id', verificarAdmin, async (req, res) => {

    try {
        await Curso.excluir(req.params.id);
        res.redirect('/academico/gerenciar/cursos');
    } catch (error) {
        res.send(error.message);
    }
});

module.exports = router;