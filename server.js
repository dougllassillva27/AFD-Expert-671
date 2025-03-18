const express = require('express');
const multer = require('multer');
const cors = require('cors');
const iconv = require('iconv-lite'); // Biblioteca para conversão de codificação

const app = express();
const port = 56000;

app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function listarRegistros(arquivo) {
  const registros = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  let linhasInvalidas = new Set(); // Usando um Set para armazenar linhas inválidas e evitar duplicatas

  // 🔥 Converte para UTF-8 corretamente, mesmo que o arquivo tenha outra codificação
  let data = iconv.decode(arquivo, 'utf-8');

  // Se ainda houver caracteres estranhos, tenta ISO-8859-1 (Windows-1252)
  if (data.includes('�')) {
    console.log('Detectado erro de codificação. Tentando converter para ISO-8859-1...');
    data = iconv.decode(arquivo, 'latin1'); // Alternativa para acentuação errada
  }

  // Trata as quebras de linha tanto de CRLF (\r\n) quanto de LF (\n)
  const linhas = data.split(/\r?\n/); // Isso pega ambos CRLF e LF como quebra de linha

  let totalLinhas = 0;
  let ultimaSequencia = null; // Variável para armazenar o valor da última linha válida

  linhas.forEach((linha, index) => {
    totalLinhas++;

    if (linha.trim()) {
      // Verifica se a linha não está vazia
      const tipoRegistro = linha.substring(9, 10); // Obtém o tipo de registro
      const numeroLinha = parseInt(linha.substring(0, 9), 10); // Pega a sequência numérica da linha

      // Valida a sequência das linhas
      if (ultimaSequencia !== null && numeroLinha !== ultimaSequencia + 1) {
        linhasInvalidas.add(linha.trim()); // Adiciona a linha inválida ao Set
      }

      // Atualiza a última sequência
      ultimaSequencia = numeroLinha;

      // Adiciona o cabeçalho (Tipo 1) e os demais registros corretamente
      if (tipoRegistro === '1' && index === 0) {
        registros[1].push(linha.trim()); // Garante que o cabeçalho seja armazenado
      } else if (registros[tipoRegistro]) {
        registros[tipoRegistro].push(linha.trim());
      } else {
        // Caso o tipo não seja válido (não seja 2, 3, 4, 5 ou 6), adiciona à lista de linhas inválidas
        linhasInvalidas.add(linha.trim());
      }
    }
  });

  console.log('Total de linhas no arquivo:', totalLinhas);

  return { registros, linhasInvalidas: Array.from(linhasInvalidas) }; // Converte o Set de volta para um array
}

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ erro: 'Nenhum arquivo foi enviado.' });
  }

  // Verificar o tipo do arquivo
  const tipoArquivo = req.file.mimetype;
  if (!tipoArquivo.includes('text')) {
    return res.status(400).json({ erro: 'O arquivo enviado não é um arquivo de texto válido.' });
  }

  const { registros, linhasInvalidas } = listarRegistros(req.file.buffer);

  // Garantir que o cabeçalho (Tipo 1) existe
  let dataInicio = null;
  let dataFim = null;

  if (registros[1] && registros[1].length > 0) {
    const cabecalho = registros[1][0]; // Primeiro registro do tipo 1
    dataInicio = cabecalho.substring(206, 216); // Posições 207-216
    dataFim = cabecalho.substring(216, 226); // Posições 217-226
  }

  // Extrair a última alteração da empresa (Tipo 2)
  let ultimaAlteracaoEmpresa = null;
  if (registros[2] && registros[2].length > 0) {
    const ultimaLinhaTipo2 = registros[2][registros[2].length - 1]; // Última linha do Tipo 2
    ultimaAlteracaoEmpresa = {
      dataHoraGravacao: ultimaLinhaTipo2.substring(10, 34).trim(), // Posições 11-34
      cnpjCpfEmpregador: ultimaLinhaTipo2.substring(49, 63).trim(), // Posições 50-63
      razaoSocial: ultimaLinhaTipo2.substring(77, 227).trim(), // Posições 78-227
    };
  }

  return res.json({
    descricao: 'Todos os tipos de registros:',
    registros: registros,
    linhasInvalidas: linhasInvalidas, // Incluindo as linhas inválidas na resposta
    totalLinhas: req.file.buffer.toString().split(/\r?\n/).length,
    dataInicio: dataInicio,
    dataFim: dataFim,
    ultimaAlteracaoEmpresa: ultimaAlteracaoEmpresa, // Adicionando a última alteração da empresa
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://0.0.0.0:${port}`);
});
