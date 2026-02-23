const express = require('express');
const router = express.Router();

const Matricula = require('../modules/academico/models/Matricula');
const { verificarAluno } = require('../middleware/authMiddleware');

/* =====================================================
   PAINEL DO ALUNO
===================================================== */
router.get('/aluno/painel', verificarAluno, async (req, res) => {

    try {

        const alunoId = req.session.user.id;

        const turma = await Matricula.buscarTurmaDoAluno(alunoId);

        res.render('alunoPainel', {
            user: req.session.user,
            turma
        });

    } catch (error) {
        console.error("Erro ao carregar painel do aluno:", error);
        res.status(500).render('erro', { message: "Erro ao carregar painel." });
    }
});

module.exports = router;