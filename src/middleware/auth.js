// Middleware de autenticação e autorização por papel.
const jwt = require('jsonwebtoken');
const Erro = require('../erro');
function autenticar(req, res, next) {
    const h = req.headers.authorization || '';
    if (!h.startsWith('Bearer '))
        return next(new Erro(401, 'Faça login.'));
    try {
        // Aceita apenas HS256, o algoritmo usado na emissão do token.
        req.usuario = jwt.verify(h.slice(7), process.env.JWT_SECRET, { algorithms: ['HS256'] });
    }
    catch {
        return next(new Erro(401, 'Token inválido ou expirado.'));
    }
    next();
}
function papel(p) {
    return (req, res, next) => req.usuario.papel === p ? next() : next(new Erro(403, 'Sem permissão.'));
}
module.exports = { autenticar, papel };
