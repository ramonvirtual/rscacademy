const express = require('express');
const router = express.Router();

const Disciplina = require('../modules/academico/models/Disciplina');
const Matricula = require('../modules/academico/models/Matricula');
const Nota = require('../modules/academico/models/Nota');
const Avaliacao = require('../modules/academico/models/Avaliacao');

const { verificarLogin } = require('../middleware/authMiddleware');

/* =====================================================
   PAINEL PROFESSOR
===================================================== */
router.get('/professor/painel', verificarLogin, async (req, res) => {

    try {

        if (!req.session.user || req.session.user.perfil !== 'professor')
            return res.redirect('/');

        const professorId = req.session.user.id;

        const disciplinas = await Disciplina.listarPorProfessor(professorId);

        res.render('professorPainel', {
            user: req.session.user,
            disciplinas
        });

    } catch (error) {
        console.error("Erro ao carregar painel do professor:", error);
        res.status(500).render('erro', {
            message: "Erro ao carregar painel do professor."
        });
    }
});


/* =====================================================
   LISTAR ALUNOS DA TURMA (SEGURANÇA)
===================================================== */
router.get('/professor/turma/:turmaId', verificarLogin, async (req, res) => {

    try {

        if (!req.session.user || req.session.user.perfil !== 'professor')
            return res.redirect('/');

        const professorId = req.session.user.id;
        const turmaId = req.params.turmaId;

        const autorizado = await Disciplina.professorTemTurma(professorId, turmaId);

        if (!autorizado) {
            return res.status(403).render('erro', {
                message: "Acesso não autorizado a esta turma."
            });
        }

        const alunos = await Matricula.listarAlunosPorTurma(turmaId);

        res.render('professorTurma', {
            user: req.session.user,
            alunos
        });

    } catch (error) {
        console.error("Erro ao acessar turma:", error);
        res.status(500).render('erro', {
            message: "Erro ao carregar turma."
        });
    }
});


/* =====================================================
   LISTAR AVALIAÇÕES DA DISCIPLINA
===================================================== */
router.get('/professor/disciplina/:disciplinaId/avaliacoes', verificarLogin, async (req, res) => {

    try {

        if (!req.session.user || req.session.user.perfil !== 'professor')
            return res.redirect('/');

        const professorId = req.session.user.id;
        const disciplinaId = req.params.disciplinaId;

        const autorizado = await Disciplina.professorTemDisciplina(
            professorId,
            disciplinaId
        );

        if (!autorizado)
            return res.status(403).render('erro', {
                message: "Acesso não autorizado."
            });

        const avaliacoes = await Avaliacao.listarPorDisciplina(disciplinaId);

        res.render('professorAvaliacoes', {
            user: req.session.user,
            disciplinaId,
            avaliacoes
        });

    } catch (error) {
        console.error("Erro ao listar avaliações:", error);
        res.status(500).render('erro', {
            message: "Erro ao carregar avaliações."
        });
    }
});


/* =====================================================
   CRIAR NOVA AVALIAÇÃO
===================================================== */
router.post('/professor/disciplina/:disciplinaId/avaliacoes', verificarLogin, async (req, res) => {

    try {

        if (!req.session.user || req.session.user.perfil !== 'professor')
            return res.redirect('/');

        const professorId = req.session.user.id;
        const disciplinaId = req.params.disciplinaId;
        const { titulo, peso } = req.body;

        const autorizado = await Disciplina.professorTemDisciplina(
            professorId,
            disciplinaId
        );

        if (!autorizado)
            return res.status(403).render('erro', {
                message: "Acesso não autorizado."
            });

        await Avaliacao.criar(disciplinaId, titulo, peso);

        res.redirect(`/professor/disciplina/${disciplinaId}/avaliacoes`);

    } catch (error) {
        console.error("Erro ao criar avaliação:", error);
        res.status(500).render('erro', {
            message: "Erro ao criar avaliação."
        });
    }
});


/* =====================================================
   LANÇAMENTO DE NOTAS POR AVALIAÇÃO
===================================================== */
router.get('/professor/avaliacao/:avaliacaoId/notas', verificarLogin, async (req, res) => {

    try {

        if (!req.session.user || req.session.user.perfil !== 'professor')
            return res.redirect('/');

        const avaliacaoId = req.params.avaliacaoId;

        const avaliacao = await Avaliacao.buscarPorId(avaliacaoId);

        if (!avaliacao)
            return res.status(404).render('erro', {
                message: "Avaliação não encontrada."
            });

        const autorizado = await Disciplina.professorTemDisciplina(
            req.session.user.id,
            avaliacao.disciplina_id
        );

        if (!autorizado)
            return res.status(403).render('erro', {
                message: "Acesso não autorizado."
            });

        const alunos = await Nota.listarPorAvaliacao(avaliacaoId);

        res.render('professorNotas', {
            user: req.session.user,
            avaliacaoId,
            alunos,
            titulo: avaliacao.titulo
        });

    } catch (error) {
        console.error("Erro ao carregar notas:", error);
        res.status(500).render('erro', {
            message: "Erro ao carregar notas."
        });
    }
});


/* =====================================================
   SALVAR NOTA
===================================================== */
router.post('/professor/avaliacao/:avaliacaoId/notas', verificarLogin, async (req, res) => {

    try {

        if (!req.session.user || req.session.user.perfil !== 'professor')
            return res.redirect('/');

        const avaliacaoId = req.params.avaliacaoId;
        const { aluno_id, nota } = req.body;

        if (!aluno_id || nota === undefined)
            return res.send("Dados inválidos.");

        if (nota < 0 || nota > 10)
            return res.send("Nota deve estar entre 0 e 10.");

        const avaliacao = await Avaliacao.buscarPorId(avaliacaoId);

        const autorizado = await Disciplina.professorTemDisciplina(
            req.session.user.id,
            avaliacao.disciplina_id
        );

        if (!autorizado)
            return res.status(403).render('erro', {
                message: "Acesso não autorizado."
            });

        await Nota.salvar(aluno_id, avaliacaoId, nota);

        res.redirect(`/professor/avaliacao/${avaliacaoId}/notas`);

    } catch (error) {
        console.error("Erro ao salvar nota:", error);
        res.status(500).render('erro', {
            message: "Erro ao salvar nota."
        });
    }
});

/* =====================================================
   DIÁRIO COMPLETO DA DISCIPLINA
===================================================== */
router.get('/professor/disciplina/:disciplinaId/diario', verificarLogin, async (req, res) => {

    try {

        if (!req.session.user || req.session.user.perfil !== 'professor')
            return res.redirect('/');

        const disciplinaId = req.params.disciplinaId;
        const professorId = req.session.user.id;

        const autorizado = await Disciplina.professorTemDisciplina(
            professorId,
            disciplinaId
        );

        if (!autorizado)
            return res.status(403).render('erro', {
                message: "Acesso não autorizado."
            });

        const dados = await Nota.diarioCompleto(disciplinaId);

        res.render('professorDiario', {
            user: req.session.user,
            disciplinaId,
            avaliacoes: dados.avaliacoes,
            alunos: dados.alunos,
            notas: dados.notas
        });

    } catch (error) {
        console.error("Erro ao carregar diário:", error);
        res.status(500).render('erro', {
            message: "Erro ao carregar diário."
        });
    }
});

/* =====================================================
   SALVAR DIÁRIO COMPLETO (EDIÇÃO EM MASSA)
===================================================== */
router.post('/professor/disciplina/:disciplinaId/diario', verificarLogin, async (req, res) => {

    try {

        if (!req.session.user || req.session.user.perfil !== 'professor')
            return res.redirect('/');

        const disciplinaId = req.params.disciplinaId;
        const professorId = req.session.user.id;

        // 🔒 Segurança
        const autorizado = await Disciplina.professorTemDisciplina(
            professorId,
            disciplinaId
        );

        if (!autorizado)
            return res.status(403).render('erro', {
                message: "Acesso não autorizado."
            });

        const { notas } = req.body;

        if (!notas)
            return res.redirect(`/professor/disciplina/${disciplinaId}/diario`);

        for (const chave in notas) {

            const [aluno_id, avaliacao_id] = chave.split('_');
            const valor = parseFloat(notas[chave]);

            if (!isNaN(valor) && valor >= 0 && valor <= 10) {
                await Nota.salvar(aluno_id, avaliacao_id, valor);
            }

        }

        res.redirect(`/professor/disciplina/${disciplinaId}/diario`);

    } catch (error) {
        console.error("Erro ao salvar diário:", error);
        res.status(500).render('erro', {
            message: "Erro ao salvar alterações."
        });
    }
});

module.exports = router;