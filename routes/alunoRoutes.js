const boletimController = require('../controllers/boletimController');

const express = require('express');
const router = express.Router();

const Nota = require('../modules/academico/models/Nota');
const { verificarAluno } = require('../middleware/authMiddleware');

/* =====================================================
   PAINEL DO ALUNO
===================================================== */
router.get('/aluno/painel', verificarAluno, async (req, res) => {

    try {

        const alunoId = req.session.user.id;

        const dados = await Nota.boletimAluno(alunoId);

        res.render('alunoPainel', {
            user: req.session.user,
            dados
        });

    } catch (error) {
        console.error("Erro ao carregar painel do aluno:", error);
        res.status(500).render('erro', {
            message: "Erro ao carregar painel do aluno."
        });
    }
});

router.get('/aluno/boletim/pdf', verificarAluno, boletimController.gerarBoletim);

module.exports = router;