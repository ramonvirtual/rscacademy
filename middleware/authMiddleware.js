function verificarLogin(req, res, next) {

    if (!req.session.user) {
        return res.redirect('/');
    }

    next();
}

function verificarAdmin(req, res, next) {

    if (!req.session.user || req.session.user.perfil !== 'administrador') {
        return res.redirect('/');
    }

    next();
}

function verificarAluno(req, res, next) {

    if (!req.session.user || req.session.user.perfil !== 'aluno') {
        return res.redirect('/');
    }

    next();
}

module.exports = {
    verificarLogin,
    verificarAdmin,
    verificarAluno
};