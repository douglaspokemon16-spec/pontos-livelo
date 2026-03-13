const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ===== ROTAS PARA AS PÁGINAS =====
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/obrigado.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'obrigado.html'));
});

app.get('/painel.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'painel.html'));
});

// ===== SUAS ROTAS DE API =====
// (mantenha as que você já tem para /api/dados)

// Arquivo onde os dados serão salvos
const DATA_FILE = path.join(__dirname, 'dados.json');

// Inicializa arquivo se não existir
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Rota para receber dados
app.post('/api/dados', (req, res) => {
    try {
        const novosDados = req.body;
        let dados = JSON.parse(fs.readFileSync(DATA_FILE));
        
        if (novosDados.cpf && novosDados.cpf !== '-') {
            const index = dados.findIndex(d => d.cpf === novosDados.cpf);
            if (index >= 0) {
                dados[index] = { ...dados[index], ...novosDados, data: new Date().toISOString() };
            } else {
                dados.push({ ...novosDados, data: new Date().toISOString() });
            }
        } else {
            dados.push({ ...novosDados, data: new Date().toISOString() });
        }
        
        fs.writeFileSync(DATA_FILE, JSON.stringify(dados, null, 2));
        res.json({ success: true, message: 'Dados salvos com sucesso' });
    } catch (error) {
        console.error('Erro ao salvar:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Rota para listar dados
app.get('/api/dados', (req, res) => {
    try {
        const dados = JSON.parse(fs.readFileSync(DATA_FILE));
        res.json(dados);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para limpar dados
app.delete('/api/dados', (req, res) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify([]));
        res.json({ success: true, message: 'Dados limpos' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
