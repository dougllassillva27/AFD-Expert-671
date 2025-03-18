const express = require('express');
const multer = require('multer');
const cors = require('cors');
const iconv = require('iconv-lite'); // 📌 Biblioteca para converter a codificação

const app = express();
const port = 56000;

app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const tipoRegistroDescricao = {
  2: 'Registros do tipo 2 (Identificação da empresa no REP):',
  3: 'Registros do tipo 3 (Marcação de ponto para REP-C e REP-A):',
  4: 'Registros do tipo 4 (Ajuste do relógio):',
  5: 'Registros do tipo 5 (Inclusão, alteração ou exclusão de empregado no REP):',
  6: 'Registros do tipo 6 (Eventos sensíveis do REP):',
};

function listarRegistros(arquivo) {
  const registros = { 2: [], 3: [], 4: [], 5: [], 6: [] };

  // 🔥 Converte para UTF-8 corretamente, mesmo que o arquivo tenha outra codificação
  let data = iconv.decode(arquivo, 'utf-8');

  // Se ainda houver caracteres estranhos, tenta ISO-8859-1 (Windows-1252)
  if (data.includes('�')) {
    console.log('Detectado erro de codificação. Tentando converter para ISO-8859-1...');
    data = iconv.decode(arquivo, 'latin1'); // Alternativa para acentuação errada
  }

  const linhas = data.split(/\r?\n/);

  linhas.forEach((linha) => {
    if (linha.trim()) {
      const tipoRegistro = linha.substring(9, 10);
      if (registros[tipoRegistro]) {
        registros[tipoRegistro].push(linha.trim());
      }
    }
  });

  return registros;
}

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ erro: 'Nenhum arquivo foi enviado.' });
  }

  const registros = listarRegistros(req.file.buffer);
  const { tipo } = req.body;

  if (tipo && registros[tipo]) {
    return res.json({
      descricao: tipoRegistroDescricao[tipo],
      registros: registros[tipo] || [],
    });
  }

  return res.json({
    descricao: 'Todos os tipos de registros:',
    registros: registros,
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://0.0.0.0:${port}`);
});
