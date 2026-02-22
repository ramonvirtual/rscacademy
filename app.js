require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'segredo_super_seguro',
    resave: false,
    saveUninitialized: false
}));

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use('/', authRoutes);

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});