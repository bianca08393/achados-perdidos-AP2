// Camada de dados dos usuários.
// Parâmetros evitam que a entrada seja interpretada como SQL.
const db = require('./db');
/**
 * Busca por email.
 * @param {string} email
 * @returns {object|undefined} Registro encontrado.
 * @throws {Error} Falha no banco.
 */
function buscar(email) {
    return db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
}
/**
 * Insere usuário.
 * @param {object} u Dados com hash.
 * @returns {number} ID criado.
 * @throws {Error} Email duplicado ou falha no banco.
 */
function criar(u) {
    return Number(db.prepare('INSERT INTO usuarios(nome,email,senha,papel) VALUES (?,?,?,?)').run(u.nome, u.email, u.senha, u.papel).lastInsertRowid);
}
module.exports = { buscar, criar };
