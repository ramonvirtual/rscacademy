require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

/* =====================================================
   CONFIGURAÇÕES BÁSICAS
===================================================== */

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'segredo_super_seguro',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // alterar para true quando usar HTTPS
        maxAge: 1000 * 60 * 60 * 2 // 2 horas
    }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/* =====================================================
   ROTAS DE AUTENTICAÇÃO
===================================================== */

const authRoutes = require('./routes/authRoutes');
app.use('/', authRoutes);

/* =====================================================
   MÓDULO ACADÊMICO (ADMIN)
===================================================== */

const cursoRoutes = require('./routes/cursoRoutes');
const turmaRoutes = require('./routes/turmaRoutes');
const disciplinaRoutes = require('./routes/disciplinaRoutes');
const matriculaRoutes = require('./routes/matriculaRoutes');

app.use('/academico', cursoRoutes);
app.use('/academico', turmaRoutes);
app.use('/academico', disciplinaRoutes);
app.use('/academico', matriculaRoutes);

/* =====================================================
   PAINEL PROFESSOR
===================================================== */

const professorRoutes = require('./routes/professorRoutes');
app.use('/', professorRoutes);

/* =====================================================
   PAINEL ALUNO
===================================================== */

const alunoRoutes = require('./routes/alunoRoutes');
app.use('/', alunoRoutes);

/* =====================================================
   TRATAMENTO 404 (DEVE FICAR POR ÚLTIMO)
===================================================== */

app.use((req, res) => {
    res.status(404).render('404', {
        message: "Página não encontrada."
    });
});

/* =====================================================
   TRATAMENTO GLOBAL DE ERROS
===================================================== */

app.use((err, req, res, next) => {
    console.error("Erro global:", err);
    res.status(500).render('erro', {
        message: "Erro interno no servidor."
    });
});

/* =====================================================
   INICIALIZAÇÃO DO SERVIDOR
===================================================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});