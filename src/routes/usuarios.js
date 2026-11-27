// Rotas HTTP de cadastro e login.
const router = require('express').Router();
const s = require('../services/usuarios');
const { rateLimit } = require('express-rate-limit');
// Limita cadastros automatizados e consultas repetidas de emails.
router.post('/cadastro', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, message: { erro: 'Muitas tentativas. Aguarde.' } }), async (req, res, next) => {
    try {
        res.status(201).json(await s.cadastrar(req.body || {}));
    }
    catch (e) {
        next(e);
    }
});
// Limita tentativas para dificultar ataques de força bruta.
router.post('/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, message: { erro: 'Muitas tentativas. Aguarde.' } }), async (req, res, next) => {
    try {
        res.json(await s.login(req.body || {}));
    }
    catch (e) {
        next(e);
    }
});
module.exports = router;
