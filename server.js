const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, './'))); // Serve arquivos estáticos

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
        
        // Lê dados existentes
        let dados = JSON.parse(fs.readFileSync(DATA_FILE));
        
        // Se tem CPF, procura se já existe
        if (novosDados.cpf && novosDados.cpf !== '-') {
            const index = dados.findIndex(d => d.cpf === novosDados.cpf);
            
            if (index >= 0) {
                // Atualiza existente
                dados[index] = { ...dados[index], ...novosDados, data: new Date().toISOString() };
                console.log(`✅ Dados atualizados para CPF: ${novosDados.cpf}`);
            } else {
                // Adiciona novo
                dados.push({ ...novosDados, data: new Date().toISOString() });
                console.log(`✅ Novo cliente criado: ${novosDados.cpf}`);
            }
        } else {
            dados.push({ ...novosDados, data: new Date().toISOString() });
            console.log(`✅ Dados salvos (sem CPF)`);
        }
        
        // Salva
        fs.writeFileSync(DATA_FILE, JSON.stringify(dados, null, 2));
        
        res.json({ success: true, message: 'Dados salvos com sucesso' });
    } catch (error) {
        console.error('❌ Erro ao salvar:', error);
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

// Rota de teste
app.get('/api/status', (req, res) => {
    res.json({ status: 'online', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📁 Dados salvos em: ${DATA_FILE}`);
});