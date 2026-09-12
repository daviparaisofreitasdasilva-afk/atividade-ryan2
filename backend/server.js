const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'minha_chave_secreta_super_segura'; // Em produção, use variáveis de ambiente

// Middlewares Globais
app.use(cors());
app.use(express.json());

// Usuários fictícios para validação
const usuarios = [
    { id: 1, email: 'admin@techstore.com', senha: '123', role: 'admin', nome: 'Administrador' },
    { id: 2, email: 'user@techstore.com', senha: '123', role: 'user', nome: 'Usuário Comum' }
];

// Banco de dados simulado em memória
let produtos = [
    { id: 1, nome: "Notebook Gamer", categoria: "Notebooks", preco: 4500.00, quantidade: 5 },
    { id: 2, nome: "Mouse Sem Fio", categoria: "Periféricos", preco: 80.00, quantidade: 15 }
];

// =========================================================================
// MIDDLEWARES DE AUTENTICAÇÃO E AUTORIZAÇÃO
// =========================================================================

// Middleware 1: Autenticação (valida se o token JWT existe e é válido)
function autenticarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    // Formato esperado: "Bearer TOKEN"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ mensagem: 'Acesso negado. Token não fornecido!' });
    }

    jwt.verify(token, SECRET_KEY, (err, usuarioDecodificado) => {
        if (err) {
            return res.status(403).json({ mensagem: 'Token inválido ou expirado!' });
        }
        req.usuario = usuarioDecodificado; // Anexa os dados do token na requisição
        next();
    });
}

// Middleware 2: Autorização (valida se o usuário tem permissão de Admin)
function autorizarAdmin(req, res, next) {
    if (req.usuario && req.usuario.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ mensagem: 'Acesso proibido. Apenas administradores podem realizar esta ação!' });
    }
}

// =========================================================================
// ROTAS
// =========================================================================

// Rota Pública: Autenticação / Login
app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    const usuario = usuarios.find(u => u.email === email && u.senha === senha);

    if (!usuario) {
        return res.status(401).json({ mensagem: 'E-mail ou senha incorretos!' });
    }

    // Gera o token JWT com payload incluindo id, nome e papel (role)
    const token = jwt.sign(
        { id: usuario.id, nome: usuario.nome, role: usuario.role },
        SECRET_KEY,
        { expiresIn: '1h' }
    );

    res.status(200).json({
        mensagem: 'Login realizado com sucesso!',
        token,
        usuario: { nome: usuario.nome, role: usuario.role }
    });
});

// Rota Pública: Listagem de produtos
app.get('/produtos', (req, res) => {
    res.status(200).json(produtos);
});

// Rota Protegida: Cadastro de produto (Requer Token VÁLIDO e Role ADMIN)
app.post('/produtos', autenticarToken, autorizarAdmin, (req, res) => {
    const { nome, categoria, preco, quantidade } = req.body;

    if (!nome || !categoria || !preco || !quantidade) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatórios!" });
    }

    const novoProduto = {
        id: Date.now(),
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