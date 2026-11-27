// Camada de apresentação: eventos, fetch e atualização do DOM.
const $ = id => document.getElementById(id);
let sessao = null, editando = null;
async function api(rota, metodo = 'GET', corpo) {
    const headers = { 'Content-Type': 'application/json' };
    if (sessao)
        headers.Authorization = 'Bearer ' + sessao.token;
    const r = await fetch('/api' + rota, { method: metodo, headers, body: corpo ? JSON.stringify(corpo) : undefined });
    if (r.status === 204)
        return;
    if (r.status === 401 && sessao) {
        $('sair').click();
        mensagem('Sessão expirada. Faça login novamente.');
        throw new Error('Sessão expirada. Faça login novamente.');
    }
    const d = await r.json();
    if (!r.ok)
        throw new Error(d.erro || 'Erro na requisição');
    return d;
}
function mensagem(t) {
    $('mensagem').textContent = t;
}
function formulario(id, acao) {
    $(id).addEventListener('submit', async (e) => {
        e.preventDefault();
        const b = e.target.querySelector('button[type=submit],button:not([type])');
        if (b.disabled)
            return;
        b.disabled = true; // Evita envio duplicado enquanto a API responde.
        try {
            await acao(Object.fromEntries(new FormData(e.target)));
        }
        catch (err) {
            mensagem(err.message);
        }
        finally {
            b.disabled = false;
        }
    });
}
formulario('cadastro', async (d) => {
    await api('/usuarios/cadastro', 'POST', d);
    $('cadastro').reset();
    mensagem('Cadastro realizado. Faça login.');
});
formulario('login', async (d) => {
    sessao = await api('/usuarios/login', 'POST', d);
    $('acesso').hidden = true;
    $('mural').hidden = false;
    $('item').hidden = sessao.usuario.papel !== 'usuario';
    $('usuario').textContent = sessao.usuario.nome + ' - ' + sessao.usuario.papel;
    $('login').reset();
    mensagem('');
    await carregar();
});
function limpar() {
    editando = null;
    $('item').reset();
    $('formTitulo').textContent = 'Cadastrar item';
}
$('cancelar').onclick = limpar;
$('sair').onclick = () => {
    sessao = null;
    limpar();
    $('mural').hidden = true;
    $('acesso').hidden = false;
    $('lista').replaceChildren();
    $('totais').textContent = '';
    mensagem('');
};
formulario('item', async (d) => {
    await api('/itens' + (editando ? '/' + editando : ''), editando ? 'PUT' : 'POST', d);
    limpar();
    mensagem('Item salvo.');
    await carregar();
});
function botao(texto, acao) {
    const b = document.createElement('button');
    b.textContent = texto;
    b.onclick = async () => {
        b.disabled = true;
        try {
            await acao();
        }
        catch (e) {
            mensagem(e.message);
        }
        finally {
            b.disabled = false;
        }
    };
    return b;
}
function card(i) {
    const a = document.createElement('article');
    const h = document.createElement('h3');
    h.textContent = i.titulo;
    const p = document.createElement('p'); // textContent impede que descrição seja executada como HTML.
    p.textContent = i.descricao + ' | ' + i.tipo + ' | ' + i.status + ' | ' + i.autor;
    a.append(h, p);
    if (sessao.usuario.papel === 'usuario' && i.usuario_id === sessao.usuario.id && i.status === 'aberto') {
        a.append(botao('Editar', () => {
            editando = i.id;
            for (const k of ['titulo', 'descricao', 'tipo'])
                $('item').elements[k].value = i[k];
            $('formTitulo').textContent = 'Editar item';
        }), botao('Devolver', async () => {
            await api('/itens/' + i.id + '/devolver', 'POST');
            await carregar();
        }), botao('Excluir', async () => {
            await api('/itens/' + i.id, 'DELETE');
            await carregar();
        }));
    }
    return a;
}
async function carregar() {
    $('estado').textContent = 'Carregando...';
    $('lista').replaceChildren();
    $('totais').textContent = '';
    try {
        const itens = await api('/itens');
        $('lista').replaceChildren(...itens.map(card));
        $('estado').textContent = itens.length ? 'Itens carregados.' : 'Nenhum item cadastrado.';
        if (sessao.usuario.papel === 'admin') {
            const t = await api('/itens/estatisticas');
            $('totais').textContent = 'Total: ' + t.reduce((s, i) => s + i.total, 0) + ' | ' + t.map(i => i.status + ': ' + i.total).join(' | ');
        }
    }
    catch (e) {
        $('estado').textContent = 'Erro: ' + e.message;
    }
}
