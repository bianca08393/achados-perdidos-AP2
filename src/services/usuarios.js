// Camada de serviço: valida cadastro e autentica usuários.
const dados = require('../data/usuarios');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Erro = require('../erro');
/**
 * Valida credenciais.
 * @param {object} u
 * @returns {object} Credenciais normalizadas.
 * @throws {Erro} 400 entrada inválida.
 */
function validar(u) {
    // bcrypt ignora bytes após o limite de 72; rejeitamos senhas maiores.
    if (typeof u.email !== 'string' || u.email.length > 254 || !/^\S+@\S+\.\S+$/.test(u.email.trim()) || typeof u.senha !== 'string' || u.senha.length < 8 || Buffer.byteLength(u.senha) > 72)
        throw new Erro(400, 'Email ou senha inválidos (senha de 8 a 72 bytes).');
    return { email: u.email.trim().toLowerCase(), senha: u.senha };
}
/**
 * Cadastra usuário comum.
 * @param {object} u
 * @returns {Promise<object>} ID.
 * @throws {Erro} 400 ou 409.
 */
async function cadastrar(u) {
    const c = validar(u);
    if (typeof u.nome !== 'string' || !u.nome.trim() || u.nome.length > 100)
        throw new Erro(400, 'Nome inválido.');
    if (dados.buscar(c.email))
        throw new Erro(409, 'Email já cadastrado.');
    // O papel não vem do formulário para impedir cadastro como administrador.
    // Custo 10 dificulta tentativas de descobrir a senha sem pesar demais no servidor.
    const senha = await bcrypt.hash(c.senha, 10);
    try {
        return { id: dados.criar({ ...c, nome: u.nome.trim(), senha, papel: 'usuario' }) };
    }
    catch (e) {
        if (e.code === 'SQLITE_CONSTRAINT_UNIQUE')
            throw new Erro(409, 'Email já cadastrado.');
        throw e;
    }
}
/**
 * Autentica e gera token.
 * @param {object} u
 * @returns {Promise<object>} Token e usuário.
 * @throws {Erro} 400 ou 401.
 */
async function login(u) {
    const c = validar(u), registro = dados.buscar(c.email);
    if (!registro || !await bcrypt.compare(c.senha, registro.senha))
        throw new Erro(401, 'Credenciais incorretas.');
    return { token: jwt.sign({ id: registro.id, papel: registro.papel }, process.env.JWT_SECRET, { expiresIn: '2h', algorithm: 'HS256' }), usuario: { id: registro.id, nome: registro.nome, papel: registro.papel } };
}
module.exports = { cadastrar, login };
