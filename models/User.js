const db = require('../config/db');

class User {

    static async findByMatricula(matricula) {
        const [rows] = await db.query(
            "SELECT * FROM users WHERE matricula = ?",
            [matricula]
        );
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.query(
            "SELECT * FROM users WHERE id = ?",
            [id]
        );
        return rows[0];
    }

    static async create(nome, email, matricula, senhaHash, perfil) {
        await db.query(
            "INSERT INTO users (nome,email,matricula,senha,perfil) VALUES (?,?,?,?,?)",
            [nome, email, matricula, senhaHash, perfil]
        );
    }

    static async listarTodos() {
        const [rows] = await db.query(
            "SELECT id,nome,email,matricula,perfil FROM users"
        );
        return rows;
    }

    static async update(id, nome, email, matricula, perfil) {
        await db.query(
            "UPDATE users SET nome=?, email=?, matricula=?, perfil=? WHERE id=?",
            [nome, email, matricula, perfil, id]
        );
    }

    static async delete(id) {
        await db.query(
            "DELETE FROM users WHERE id=?",
            [id]
        );
    }

    static async updateSenha(id, senhaHash) {
        await db.query(
            "UPDATE users SET senha=? WHERE id=?",
            [senhaHash, id]
        );
    }

}



module.exports = User;