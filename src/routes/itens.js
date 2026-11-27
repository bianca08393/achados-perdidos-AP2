// Rotas HTTP dos itens; as regras ficam no serviço.
const r = require('express').Router();
const s = require('../services/itens');
const { autenticar, papel } = require('../middleware/auth');
r.use(autenticar);
r.get('/', (q, p) => p.json(s.listar()));
r.get('/estatisticas', papel('admin'), (q, p) => p.json(s.estatisticas()));
r.get('/:id', (q, p) => p.json(s.buscar(q.params.id)));
r.post('/', papel('usuario'), (q, p) => p.status(201).json(s.criar(q.body || {}, q.usuario.id)));
r.put('/:id', papel('usuario'), (q, p) => p.json(s.editar(q.params.id, q.body || {}, q.usuario.id)));
r.delete('/:id', papel('usuario'), (q, p) => {
    s.remover(q.params.id, q.usuario.id);
    p.status(204).end();
});
r.post('/:id/devolver', papel('usuario'), (q, p) => p.json(s.devolver(q.params.id, q.usuario.id)));
module.exports = r;
