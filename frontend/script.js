const API_URL = 'http://localhost:3000/produtos';

// Elementos do DOM
const formProduto = document.getElementById('form-produto');
const tabelaProdutos = document.getElementById('tabela-produtos');

// Executa a busca de produtos assim que a página é carregada
document.addEventListener('DOMContentLoaded', buscarProdutos);

// Função para buscar os produtos na API (GET)
async function buscarProdutos() {
    try {
        const resposta = await fetch(API_URL);
        
        if (!resposta.ok) {
            throw new Error('Erro ao buscar produtos.');
        }

        const produtos = await resposta.json();
        renderizarTabela(produtos);
    } catch (erro) {
        console.error('Erro na requisição GET:', erro);
        alert('Não foi possível carregar a lista de produtos.');
    }
}

// Função para renderizar os produtos no HTML
function renderizarTabela(produtos) {
    tabelaProdutos.innerHTML = ''; // Limpa a tabela antes de preencher

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
        
        // Formata o preço no padrão BRL
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

// Função para cadastrar um novo produto (POST)
formProduto.addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede o reload da página

    // Captura os dados digitados
    const novoProduto = {
        nome: document.getElementById('nome').value,
        categoria: document.getElementById('categoria').value,
        preco: parseFloat(document.getElementById('preco').value),
        quantidade: parseInt(document.getElementById('quantidade').value)
    };

    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novoProduto)
        });

        if (!resposta.ok) {
            throw new Error('Erro ao cadastrar produto.');
        }

        // Limpa os campos do formulário
        formProduto.reset();

        // Atualiza a listagem de produtos imediatamente
        await buscarProdutos();

        alert('Produto cadastrado com sucesso!');

    } catch (erro) {
        console.error('Erro na requisição POST:', erro);
        alert('Falha ao cadastrar o produto.');
    }
});