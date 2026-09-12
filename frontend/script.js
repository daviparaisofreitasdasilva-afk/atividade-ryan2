const API_URL = 'http://localhost:3000';

// Elementos do DOM
const secaoLogin = document.getElementById('secao-login');
const secaoPainel = document.getElementById('secao-painel');
const secaoCadastro = document.getElementById('secao-cadastro');
const formLogin = document.getElementById('form-login');
const formProduto = document.getElementById('form-produto');
const tabelaProdutos = document.getElementById('tabela-produtos');
const usuarioInfo = document.getElementById('usuario-info');
const nomeUsuario = document.getElementById('nome-usuario');
const btnLogout = document.getElementById('btn-logout');

// Evento ao carregar a página
document.addEventListener('DOMContentLoaded', checarAutenticacao);

// =========================================================================
// GERENCIAMENTO DE ESTADO E INTERFACE
// =========================================================================

function checarAutenticacao() {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (token && usuario) {
        secaoLogin.classList.add('hidden');
        secaoPainel.classList.remove('hidden');
        usuarioInfo.classList.remove('hidden');
        
        nomeUsuario.textContent = `Olá, ${usuario.nome} (${usuario.role.toUpperCase()})`;

        // Exibe o formulário de cadastro APENAS se for Admin
        if (usuario.role === 'admin') {
            secaoCadastro.classList.remove('hidden');
        } else {
            secaoCadastro.classList.add('hidden');
        }

        buscarProdutos();
    } else {
        secaoLogin.classList.remove('hidden');
        secaoPainel.classList.add('hidden');
        usuarioInfo.classList.add('hidden');
    }
}

// =========================================================================
// REQUISIÇÕES HTTP (FETCH)
// =========================================================================

// 1. Rota de Login (POST /login)
formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;

    try {
        const resposta = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.mensagem || 'Erro ao realizar login.');
        }

        // Armazena Token e Usuário no LocalStorage
        localStorage.setItem('token', dados.token);
        localStorage.setItem('usuario', JSON.stringify(dados.usuario));

        formLogin.reset();
        checarAutenticacao();

    } catch (erro) {
        alert(erro.message);
    }
});

// 2. Rota de Busca de Produtos (GET /produtos)
async function buscarProdutos() {
    try {
        const resposta = await fetch(`${API_URL}/produtos`);
        const produtos = await resposta.json();
        renderizarTabela(produtos);
    } catch (erro) {
        console.error('Erro na requisição GET:', erro);
    }
}

// 3. Rota de Cadastro de Produto (POST /produtos - Protegida)
formProduto.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    const novoProduto = {
        nome: document.getElementById('nome').value,
        categoria: document.getElementById('categoria').value,
        preco: parseFloat(document.getElementById('preco').value),
        quantidade: parseInt(document.getElementById('quantidade').value)
    };

    try {
        const resposta = await fetch(`${API_URL}/produtos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Inserção do Token no cabeçalho
            },
            body: JSON.stringify(novoProduto)
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.mensagem || 'Erro ao cadastrar produto.');
        }

        formProduto.reset();
        await buscarProdutos();
        alert('Produto cadastrado com sucesso!');

    } catch (erro) {
        alert(erro.message);
    }
});

// Logout
btnLogout.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    checarAutenticacao();
});

// Renderização dos elementos na tabela
function renderizarTabela(produtos) {
    tabelaProdutos.innerHTML = '';

    if (produtos.length === 0) {
        tabelaProdutos.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">Nenhum produto cadastrado.</td>
            </tr>
        `;
        return;
    }

    produtos.forEach(produto => {
        const tr = document.createElement('tr');
        const precoFormatado = produto.preco.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        tr.innerHTML = `
            <td>${produto.id}</td>
            <td>${produto.nome}</td>
            <td>${produto.categoria}</td>
            <td>${precoFormatado}</td>
            <td>${produto.quantidade} un.</td>
        `;

        tabelaProdutos.appendChild(tr);
    });
}