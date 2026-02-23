const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

const User = require('../models/User');
const { verificarLogin, verificarAdmin } = require('../middleware/authMiddleware');

/* =====================================================
   PÁGINA LOGIN
===================================================== */
router.get('/', (req, res) => {
    res.render('login');
});

/* =====================================================
   LOGIN
===================================================== */
router.post('/login', async (req, res) => {

    const { matricula, senha } = req.body;

    try {

        if (!matricula || !senha)
            return res.send("Preencha matrícula e senha.");

        const user = await User.findByMatricula(matricula);

        if (!user)
            return res.send("Matrícula não encontrada.");

        const match = await bcrypt.compare(senha, user.senha);

        if (!match)
            return res.send("Senha incorreta.");

        req.session.user = {
            id: user.id,
            nome: user.nome,
            perfil: user.perfil
        };

        /* ===== Redirecionamento Inteligente ===== */

        if (user.perfil === 'administrador')
            return res.redirect('/admin');

        if (user.perfil === 'professor')
            return res.redirect('/professor');

        if (user.perfil === 'aluno')
            return res.redirect('/aluno/painel');

    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).send("Erro interno no servidor.");
    }
});

/* =====================================================
   PAINÉIS POR PERFIL
===================================================== */

router.get('/admin', verificarAdmin, (req, res) => {
    res.render('admin', { user: req.session.user });
});

router.get('/professor', verificarLogin, (req, res) => {

    if (req.session.user.perfil !== 'professor')
        return res.redirect('/');

    res.render('professor', { user: req.session.user });
});

router.get('/aluno', verificarLogin, (req, res) => {

    if (req.session.user.perfil !== 'aluno')
        return res.redirect('/');

    res.redirect('/aluno/painel');
});

/* =====================================================
   LOGOUT
===================================================== */
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

/* =====================================================
   CADASTRO DE USUÁRIO (ADMIN)
===================================================== */
router.get('/admin/cadastro', verificarAdmin, async (req, res) => {

    const usuarios = await User.listarTodos();

    res.render('cadastroUsuario', {
        user: req.session.user,
        usuarios
    });
});

router.post('/admin/cadastro', verificarAdmin, async (req, res) => {

    const { nome, email, matricula, senha, perfil } = req.body;

    try {

        if (!nome || !email || !matricula || !senha || !perfil)
            return res.send("Preencha todos os campos.");

        if (!['professor','aluno','administrador'].includes(perfil))
            return res.send("Perfil inválido.");

        const existeMatricula = await User.findByMatricula(matricula);
        if (existeMatricula)
            return res.send("Matrícula já cadastrada.");

        const senhaHash = await bcrypt.hash(senha, 10);

        await User.create(nome, email, matricula, senhaHash, perfil);

        res.redirect('/admin/cadastro');

    } catch (error) {
        console.error("Erro ao cadastrar usuário:", error);
        res.status(500).send("Erro interno.");
    }
});

/* =====================================================
   GESTÃO DE USUÁRIOS
===================================================== */

router.get('/admin/usuarios', verificarAdmin, async (req, res) => {

    const usuarios = await User.listarTodos();

    res.render('gestaoUsuarios', {
        user: req.session.user,
        usuarios
    });
});

router.get('/admin/usuarios/editar/:id', verificarAdmin, async (req, res) => {

    const usuario = await User.findById(req.params.id);

    if (!usuario)
        return res.send("Usuário não encontrado.");

    res.render('editarUsuario', {
        user: req.session.user,
        usuario
    });
});

router.post('/admin/usuarios/editar/:id', verificarAdmin, async (req, res) => {

    const { nome, email, matricula, perfil } = req.body;

    await User.update(req.params.id, nome, email, matricula, perfil);

    res.redirect('/admin/usuarios');
});

router.get('/admin/usuarios/excluir/:id', verificarAdmin, async (req, res) => {

    if (req.params.id == req.session.user.id)
        return res.send("Você não pode excluir a si mesmo.");

    await User.delete(req.params.id);

    res.redirect('/admin/usuarios');
});

/* =====================================================
   ALTERAR SENHA PELO ADMIN
===================================================== */
router.get('/admin/usuarios/senha/:id', verificarAdmin, async (req, res) => {

    const usuario = await User.findById(req.params.id);

    if (!usuario)
        return res.send("Usuário não encontrado.");

    res.render('alterarSenhaAdmin', {
        user: req.session.user,
        usuario
    });
});

router.post('/admin/usuarios/senha/:id', verificarAdmin, async (req, res) => {

    const { novaSenha } = req.body;

    if (!novaSenha || novaSenha.length < 4)
        return res.send("Senha inválida.");

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await User.updateSenha(req.params.id, senhaHash);

    res.redirect('/admin/usuarios');
});

/* =====================================================
   ALTERAR SENHA DO PRÓPRIO USUÁRIO
===================================================== */

router.get('/perfil/senha', verificarLogin, (req, res) => {
    res.render('alterarSenhaUsuario', { user: req.session.user });
});

router.post('/perfil/senha', verificarLogin, async (req, res) => {

    const { senhaAtual, novaSenha, confirmarSenha } = req.body;

    if (!senhaAtual || !novaSenha || !confirmarSenha)
        return res.send("Preencha todos os campos.");

    if (novaSenha !== confirmarSenha)
        return res.send("Nova senha e confirmação não coincidem.");

    const usuario = await User.findById(req.session.user.id);

    const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);

    if (!senhaCorreta)
        return res.send("Senha atual incorreta.");

    const novaHash = await bcrypt.hash(novaSenha, 10);

    await User.updateSenha(usuario.id, novaHash);

    res.send("Senha alterada com sucesso.");
});

module.exports = router;