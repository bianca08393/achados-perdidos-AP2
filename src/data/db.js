// Camada de dados: abre o SQLite e cria as tabelas.
// As restrições também protegem os dados fora da interface.
require('dotenv').config();
const db = require('better-sqlite3')(process.env.DB_PATH || 'achados.db');
db.pragma('foreign_keys = ON');
db.exec(`CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, email TEXT NOT NULL UNIQUE, senha TEXT NOT NULL, papel TEXT NOT NULL CHECK(papel IN ('usuario','admin')));
CREATE TABLE IF NOT EXISTS itens (id INTEGER PRIMARY KEY, titulo TEXT NOT NULL, descricao TEXT NOT NULL, tipo TEXT NOT NULL CHECK(tipo IN ('achado','perdido')), status TEXT NOT NULL DEFAULT 'aberto' CHECK(status IN ('aberto','devolvido')), usuario_id INTEGER NOT NULL REFERENCES usuarios(id));`);
module.exports = db;
