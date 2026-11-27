// Camada de dados dos itens, com consultas parametrizadas.
const db = require('./db');
// Os placeholders separam os valores do comando SQL, evitando injeção.
// Nas alterações, dono e status também são conferidos no próprio SQL.
/**
 * Lista itens e seus autores.
 * @returns {object[]} Itens.
 * @throws {Error} Falha no banco.
 */
function listar() {
    return db.prepare('SELECT i.*, u.nome AS autor FROM itens i JOIN usuarios u ON u.id=i.usuario_id ORDER BY i.id DESC').all();
}
/**
 * Busca item.
 * @param {number} id
 * @returns {object|undefined} Item.
 * @throws {Error} Falha no banco.
 */
function buscar(id) {
    return db.prepare('SELECT * FROM itens WHERE id=?').get(id);
}
/**
 * Insere item.
 * @param {object} i Dados validados.
 * @param {number} dono
 * @returns {number} ID.
 * @throws {Error} Falha no banco.
 */
function criar(i, dono) {
    return Number(db.prepare('INSERT INTO itens(titulo,descricao,tipo,usuario_id) VALUES (?,?,?,?)').run(i.titulo, i.descricao, i.tipo, dono).lastInsertRowid);
}
/**
 * Atualiza item aberto do dono.
 * @param {number} id
 * @param {object} i
 * @param {number} dono
 * @returns {number} Linhas alteradas.
 * @throws {Error} Falha no banco.
 */
function editar(id, i, dono) {
    return db.prepare("UPDATE itens SET titulo=?,descricao=?,tipo=? WHERE id=? AND usuario_id=? AND status='aberto'").run(i.titulo, i.descricao, i.tipo, id, dono).changes;
}
/**
 * Remove item aberto do dono.
 * @param {number} id
 * @param {number} dono
 * @returns {number} Linhas removidas.
 * @throws {Error} Falha no banco.
 */
function remover(id, dono) {
    return db.prepare("DELETE FROM itens WHERE id=? AND usuario_id=? AND status='aberto'").run(id, dono).changes;
}
/**
 * Devolve item uma única vez.
 * @param {number} id
 * @param {number} dono
 * @returns {number} Linhas alteradas.
 * @throws {Error} Falha no banco.
 */
function devolver(id, dono) {
    return db.prepare("UPDATE itens SET status='devolvido' WHERE id=? AND usuario_id=? AND status='aberto'").run(id, dono).changes;
}
/**
 * Conta itens por status.
 * @returns {object[]} Totais.
 * @throws {Error} Falha no banco.
 */
function estatisticas() {
    return db.prepare('SELECT status, COUNT(*) AS total FROM itens GROUP BY status').all();
}
module.exports = { listar, buscar, criar, editar, remover, devolver, estatisticas };
