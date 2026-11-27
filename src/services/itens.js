// Camada de serviço: regras de negócio e validação dos itens.
const dados = require('../data/itens');
const Erro = require('../erro');
/**
 * Valida dados do item.
 * @param {object} i
 * @returns {object} Dados limpos.
 * @throws {Erro} 400.
 */
function validar(i) {
    if (typeof i.titulo !== 'string' || !i.titulo.trim() || i.titulo.length > 100 || typeof i.descricao !== 'string' || !i.descricao.trim() || i.descricao.length > 500 || !['achado', 'perdido'].includes(i.tipo))
        throw new Erro(400, 'Preencha os campos corretamente.');
    return { titulo: i.titulo.trim(), descricao: i.descricao.trim(), tipo: i.tipo };
}
/**
 * Busca item por ID válido.
 * @param {string} id
 * @returns {object} Item.
 * @throws {Erro} 400 ou 404.
 */
function buscar(id) {
    if (!/^\d+$/.test(String(id)) || !Number.isSafeInteger(Number(id)) || Number(id) < 1)
        throw new Erro(400, 'ID inválido.');
    const i = dados.buscar(Number(id));
    if (!i)
        throw new Erro(404, 'Item não encontrado.');
    return i;
}
/**
 * Confere dono e estado.
 * @param {string} id
 * @param {number} dono
 * @returns {object} Item aberto.
 * @throws {Erro} 400,404,403 ou 409.
 */
function conferir(id, dono) {
    const i = buscar(id); // Regra 1: impede alteração por outro usuário (IDOR).
    if (i.usuario_id !== dono)
        throw new Erro(403, 'Este item não pertence a você.');
    // Regra 2: item devolvido não pode ser devolvido ou alterado novamente.
    if (i.status !== 'aberto')
        throw new Erro(409, 'Item já devolvido.');
    return i;
}
/**
 * Lista itens públicos do mural.
 * @returns {object[]} Itens.
 * @throws {Error} Falha no banco.
 */
function listar() {
    return dados.listar();
}
/**
 * Cria item do usuário autenticado.
 * @param {object} i
 * @param {number} dono
 * @returns {object} ID.
 * @throws {Erro} 400.
 */
function criar(i, dono) {
    return { id: dados.criar(validar(i), dono) };
}
/**
 * Edita item próprio.
 * @param {string} id
 * @param {object} i
 * @param {number} dono
 * @returns {object} Item.
 * @throws {Erro} 400,403,404,409.
 */
function editar(id, i, dono) {
    conferir(id, dono);
    if (!dados.editar(Number(id), validar(i), dono))
        throw new Erro(409, 'Item alterado.');
    return buscar(id);
}
/**
 * Exclui item próprio.
 * @param {string} id
 * @param {number} dono
 * @returns {void}
 * @throws {Erro} 400,403,404,409.
 */
function remover(id, dono) {
    conferir(id, dono);
    if (!dados.remover(Number(id), dono))
        throw new Erro(409, 'Item alterado.');
}
/**
 * Marca devolução.
 * @param {string} id
 * @param {number} dono
 * @returns {object} Item.
 * @throws {Erro} 400,403,404,409.
 */
function devolver(id, dono) {
    conferir(id, dono); // A condição no UPDATE impede duas devoluções concorrentes.
    if (!dados.devolver(Number(id), dono))
        throw new Erro(409, 'Item já devolvido.');
    return buscar(id);
}
/**
 * Retorna contagem por estado.
 * @returns {object[]} Totais.
 * @throws {Error} Falha no banco.
 */
function estatisticas() {
    return dados.estatisticas();
}
module.exports = { listar, buscar, criar, editar, remover, devolver, estatisticas };
