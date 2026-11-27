// Erro usado pelos serviços para informar o status HTTP.
class Erro extends Error {
    constructor(status, mensagem) {
        super(mensagem);
        this.status = status;
    }
}
module.exports = Erro;
