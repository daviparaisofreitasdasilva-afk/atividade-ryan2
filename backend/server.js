const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors()); // Permite requisições do front-end
app.use(express.json()); // Permite receber dados em formato JSON

// "Banco de dados" simulado em memória
let produtos = [
    { id: 1, nome: "Notebook Gamer", categoria: "Notebooks", preco: 4500.00, quantidade: 5 },
    { id: 2, nome: "Mouse Sem Fio", categoria: "Periféricos", preco: 80.00, quantidade: 15 }
];

// Rota GET: Retorna todos os produtos
app.get('/produtos', (req, res) => {
    res.status(200).json(produtos);
});

// Rota POST: Cadastra um novo produto
app.post('/produtos', (req, res) => {
    const { nome, categoria, preco, quantidade } = req.body;

    // Validação simples dos dados recebidos
    if (!nome || !categoria || !preco || !quantidade) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatórios!" });
    }

    const novoProduto = {
        id: Date.now(), // Gera um ID simples único
        nome,
        categoria,
        preco: parseFloat(preco),
        quantidade: parseInt(quantidade)
    };

    produtos.push(novoProduto);
    res.status(201).json(novoProduto);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});