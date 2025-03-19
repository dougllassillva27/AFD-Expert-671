/*
MIT License

Copyright (c) 2023 Douglas Silva

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const iconv = require('iconv-lite');

const app = express();
const port = 56000;

app.use(cors());
const storage = multer.memoryStorage();
const upload = multer({ storage });

function listarRegistros(arquivo) {
  const registros = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  const linhasInvalidas = new Set();
  let data;

  // Detecção de codificação otimizada
  try {
    data = iconv.decode(arquivo, 'utf-8');
    if (data.includes('�')) data = iconv.decode(arquivo, 'latin1');
  } catch (e) {
    console.error('Erro na decodificação:', e);
    return { registros, linhasInvalidas: [], totalLinhas: 0 };
  }

  const linhas = data.split(/\r?\n/);
  let ultimaSequencia = null;

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i].trim();
    if (!linha) continue;

    const nsr = linha.substring(0, 9);
    const tipo = linha.substring(9, 10);
    const numeroLinha = parseInt(nsr, 10);

    // Validação sequencial completa
    if (ultimaSequencia !== null && numeroLinha !== ultimaSequencia + 1) {
      linhasInvalidas.add(linha);
    }
    ultimaSequencia = numeroLinha;

    // Lógica original completa
    if (tipo === '1' && i === 0) {
      registros[1].push(linha);
    } else if (registros[tipo]) {
      registros[tipo].push(linha);
    } else {
      linhasInvalidas.add(linha);
    }
  }

  return {
    registros,
    linhasInvalidas: Array.from(linhasInvalidas),
    totalLinhas: linhas.length,
  };
}

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ erro: 'Nenhum arquivo enviado' });
  if (!req.file.mimetype.includes('text')) {
    return res.status(400).json({ erro: 'Arquivo não é texto válido' });
  }

  const { registros, linhasInvalidas, totalLinhas } = listarRegistros(req.file.buffer);
  const cabecalho = registros[1]?.[0] || '';

  // Extração completa dos dados do cabeçalho
  const dataInicio = cabecalho.substring(206, 216);
  const dataFim = cabecalho.substring(216, 226);
  const dataHoraGeracao = cabecalho.substring(226, 250).trim();

  // Processamento completo do Tipo 2
  const ultimoTipo2 = registros[2]?.slice(-1)[0];
  const ultimaAlteracaoEmpresa = ultimoTipo2
    ? {
        dataHoraGravacao: ultimoTipo2.substring(10, 34).trim(),
        cnpjCpfEmpregador: ultimoTipo2.substring(49, 63).trim(),
        razaoSocial: ultimoTipo2.substring(77, 227).trim(),
      }
    : null;

  res.json({
    registros,
    linhasInvalidas,
    totalLinhas,
    dataInicio,
    dataFim,
    dataHoraGeracao,
    ultimaAlteracaoEmpresa,
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://0.0.0.0:${port}`);
});
