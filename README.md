# Achados e Perdidos

Sistema para cadastrar objetos encontrados ou perdidos. A regra principal é que somente quem cadastrou um item pode devolvê-lo, e a devolução só acontece uma vez. O mural é compartilhado entre usuários autenticados.

## Papéis
Usuário: consulta o mural, cadastra, edita, exclui e devolve seus itens abertos. Administrador: consulta o mural e os totais por status.

## Instalação
Use Node.js 22. No terminal, dentro da pasta:

```sh
npm install
```
Copie `.env.example` para `.env` (PowerShell: `Copy-Item .env.example .env`). Preencha PORT=3000, DB_PATH=achados.db e JWT_SECRET com uma chave própria de pelo menos 32 caracteres. Para gerar uma chave: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

```sh
npm run seed
npm start
```
Abra http://localhost:3000. PORT é a porta, DB_PATH é o arquivo SQLite e JWT_SECRET assina os tokens.

## Contas de teste
- aluno@teste.com / Teste1234 (usuário)
- admin@teste.com / Teste1234 (admin)

## API
Rotas protegidas recebem Authorization: Bearer TOKEN. Erros inesperados retornam 500.

| Método | Rota | Status | Papel |
|---|---|---|---|
| POST | /api/usuarios/cadastro | 201,400,409,429 | público |
| POST | /api/usuarios/login | 200,400,401,429 | público |
| GET | /api/itens | 200,401 | ambos |
| GET | /api/itens/:id | 200,400,401,404 | ambos |
| POST | /api/itens | 201,400,401,403 | usuário |
| PUT | /api/itens/:id | 200,400,401,403,404,409 | usuário |
| DELETE | /api/itens/:id | 204,400,401,403,404,409 | usuário |
| POST | /api/itens/:id/devolver | 200,400,401,403,404,409 | usuário |
| GET | /api/itens/estatisticas | 200,401,403 | admin |

Cadastro recebe nome, email e senha; login recebe email e senha. Criação e edição recebem titulo, descricao e tipo (achado ou perdido).

## Banco
usuarios: id (PK), nome, email (UNIQUE), senha (hash), papel (CHECK). itens: id (PK), titulo, descricao, tipo (CHECK), status (CHECK), usuario_id (FK). Um usuário pode ter vários itens. CHECK impede estados e tipos inválidos; UNIQUE impede contas com email repetido. JOIN mostra o autor e GROUP BY com COUNT calcula os totais (src/data/itens.js).

## Regras
Em src/services/itens.js, conferir verifica o dono e se o item ainda está aberto. Em src/data/itens.js, o UPDATE de devolução exige status aberto e o ID do dono, inclusive para requisições concorrentes. Não se edita nem exclui item devolvido.

## Segurança
- bcrypt e validação: src/services/usuarios.js.
- JWT e autorização por papel: src/middleware/auth.js.
- Proteção IDOR nas alterações: src/services/itens.js e src/data/itens.js. A leitura do mural é compartilhada por definição.
- SQL parametrizado: src/data/usuarios.js e src/data/itens.js.
- Helmet: src/app.js.
- Limite de login e cadastro: src/routes/usuarios.js.
- textContent e bloqueio de envio duplo: public/app.js.
- Segredo em .env ignorado pelo Git.

## Limitações
Não há upload de fotos, recuperação de senha ou confirmação de email. A sessão fica em memória e termina ao atualizar a página. Contas de demonstração são apenas para teste local. Não foi configurada publicação em produção. O cadastro retorna 409 para email existente, permitindo enumeração de contas mesmo com limite de tentativas. Em desenvolvimento, Helmet não força HTTPS; em produção, configure NODE_ENV=production e HTTPS. O token expira em duas horas e a interface retorna ao login ao receber 401.
