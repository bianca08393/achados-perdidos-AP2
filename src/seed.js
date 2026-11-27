// Dados de demonstração para testar os dois papéis.
const u = require('./data/usuarios');
const i = require('./data/itens');
const bcrypt = require('bcrypt');
for (const [nome, email, papel] of [['Aluno', 'aluno@teste.com', 'usuario'], ['Admin', 'admin@teste.com', 'admin']]) {
    if (!u.buscar(email))
        u.criar({ nome, email, papel, senha: bcrypt.hashSync('Teste1234', 10) });
}
if (!i.listar().length)
    i.criar({ titulo: 'Chave', descricao: 'Encontrada perto da biblioteca', tipo: 'achado' }, u.buscar('aluno@teste.com').id);
console.log('Seed concluído.');
