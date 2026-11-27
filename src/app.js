// Entrada do servidor: configura Express e tratamento de erros.
require('dotenv').config();
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
    throw new Error('Configure JWT_SECRET com pelo menos 32 caracteres.');
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const app = express();
// Helmet adiciona cabeçalhos de proteção, inclusive contra scripts externos.
// Em desenvolvimento HTTP local, não força a troca para HTTPS.
app.use(helmet({ contentSecurityPolicy: { directives: { upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null } } }));
app.use(express.json({ limit: '16kb' }));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/itens', require('./routes/itens'));
app.use(express.static(path.join(__dirname, '../public')));
app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));
app.use((e, req, res, next) => {
    // Não expõe detalhes internos do parser ao cliente.
    if (e.type === 'entity.parse.failed')
        return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
    const status = e.status || 500;
    if (status >= 500)
        console.error(e);
    res.status(status).json({ erro: status >= 500 ? 'Erro interno.' : e.message });
});
app.listen(process.env.PORT || 3000, () => console.log('Servidor iniciado.'));
