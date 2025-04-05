const dom = {
  resultado: document.getElementById('resultado'),
  searchArea: document.getElementById('searchArea'),
  searchInput: document.getElementById('searchInput'),
  searchButton: document.getElementById('searchButton'),
  fileInput: document.getElementById('file'),
  fileName: document.getElementById('file-name'),
};

let registrosData = {};
const tipoRegistroDescricao = {
  1: 'Cabeçalho:',
  2: 'Tipo 2: Registros do tipo 2 (Identificação da empresa no REP):',
  3: 'Tipo 3: Registros do tipo 3 (Marcação de ponto para REP-C e REP-A):',
  4: 'Tipo 4: Registros do tipo 4 (Ajuste do relógio):',
  5: 'Tipo 5: Registros do tipo 5 (Inclusão, alteração ou exclusão de empregado no REP):',
  6: 'Tipo 6: Registros do tipo 6 (Eventos sensíveis do REP):',
};

// Funções de formatação completas
function formatDate(dateStr) {
  if (!dateStr) return 'Não disponível';
  const [y, m, d] = dateStr.split('-');
  return d && m && y ? `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}` : 'Inválida';
}

function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return 'Não disponível';
  const [datePart, timePart] = dateTimeStr.split('T');
  return datePart && timePart ? `${datePart.split('-').reverse().join('/')} ${timePart.substring(0, 8)}` : 'Inválido';
}

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  showLoading();

  const formData = new FormData();
  formData.append('file', dom.fileInput.files[0]);

  try {
    const response = await fetch('processar_afd.php', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Erro ao processar o arquivo');
    }

    registrosData = await response.json();
    displayResult(registrosData.registros);

    // Habilitar os botões
    document.querySelectorAll('.buttons button').forEach((button) => {
      button.disabled = false;
      button.classList.remove('btn-disabled');
      button.removeAttribute('title');
    });
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao processar o arquivo: ' + error.message);
  } finally {
    hideLoading();
  }
});

// Exibição de resultados completa
function displayResult(data) {
  const chunks = [];
  for (const tipo in data) {
    chunks.push(`${tipoRegistroDescricao[tipo] || `Tipo ${tipo}:`}\n`);
    const registros = Array.isArray(data[tipo]) ? data[tipo] : Object.values(data[tipo]);
    registros.length > 0 ? chunks.push(...registros.map((linha) => `${linha}\n`)) : chunks.push('Nenhum registro encontrado.\n');
    chunks.push('-'.repeat(40) + '\n');
  }
  dom.resultado.textContent = chunks.join('');
}

function filterByType(tipo) {
  if (!registrosData || !registrosData.registros) {
    alert('Por favor, carregue um arquivo antes de usar os filtros.');
    return;
  }

  dom.searchArea.style.display = 'none'; // Oculta a área de pesquisa
  dom.searchInput.value = ''; // Limpa o campo de pesquisa
  const filteredData = tipo === 'all' ? registrosData.registros : { [tipo]: registrosData.registros[tipo] || [] };
  displayResult(filteredData);
}

function filterInvalidLines() {
  dom.searchArea.style.display = 'none';
  if (!registrosData?.linhasInvalidas) return;

  const texto = registrosData.linhasInvalidas.length > 0 ? `Linhas inválidas:\n${registrosData.linhasInvalidas.join('\n')}` : 'Nenhuma linha inválida encontrada';
  dom.resultado.textContent = texto;
}

function showDetails() {
  dom.searchArea.style.display = 'none';
  if (!registrosData?.registros) return;

  const cabecalho = registrosData.registros[1]?.[0] || '';
  const detalhes = {
    dataHoraGeracao: formatDateTime(registrosData.dataHoraGeracao),
    totalLinhas: registrosData.totalLinhas,
    serialEquipamento: cabecalho.substring(189, 206).trim(),
    dataInicio: formatDate(registrosData.dataInicio),
    dataFim: formatDate(registrosData.dataFim),
    tipo2: 0,
    tipo3: 0,
    tipo4: 0,
    tipo5: 0,
  };

  // Contagem dos registros
  for (const tipo in registrosData.registros) {
    const t = parseInt(tipo, 10);
    if (t === 2) detalhes.tipo2 = registrosData.registros[tipo].length;
    if (t === 3) detalhes.tipo3 = registrosData.registros[tipo].length;
    if (t === 4) detalhes.tipo4 = registrosData.registros[tipo].length;
    if (t === 5) detalhes.tipo5 = registrosData.registros[tipo].length;
  }

  let detalhesText = `
Detalhes do arquivo:
----------------------------------------
Data e hora da geração do arquivo: ${detalhes.dataHoraGeracao}
Quantidade de linhas no arquivo: ${detalhes.totalLinhas}
Quantidade de registros Tipo 2 (Identificação da empresa no REP): ${detalhes.tipo2}
Quantidade de registros Tipo 3 (Marcação de ponto para REP-C e REP-A): ${detalhes.tipo3}
Quantidade de registros Tipo 4 (Ajuste do relógio): ${detalhes.tipo4}
Quantidade de registros Tipo 5 (Inclusão, alteração ou exclusão de empregado no REP): ${detalhes.tipo5}

Nº serial do equipamento: ${detalhes.serialEquipamento}
Data de início dos eventos: ${detalhes.dataInicio}
Data de fim dos eventos: ${detalhes.dataFim}
`;

  if (registrosData.ultimaAlteracaoEmpresa) {
    detalhesText += `
Última alteração da empresa:
Data e hora da gravação: ${formatDateTime(registrosData.ultimaAlteracaoEmpresa.dataHoraGravacao)}
CNPJ/CPF do empregador: ${registrosData.ultimaAlteracaoEmpresa.cnpjCpfEmpregador}
Razão social: ${registrosData.ultimaAlteracaoEmpresa.razaoSocial}
`;
  }

  dom.resultado.textContent = detalhesText;
}

// Pesquisa completa
function performSearch() {
  const termo = dom.searchInput.value.trim().toLowerCase();
  if (!termo) {
    alert('Digite um termo para pesquisar');
    return;
  }

  const resultados = {};
  for (const tipo in registrosData.registros) {
    resultados[tipo] = registrosData.registros[tipo].filter((linha) => linha.toLowerCase().includes(termo));
  }
  displayResult(resultados);
}

function showInterpretedLines() {
  showLoading(); // Mostra o overlay de carregamento
  dom.searchArea.style.display = 'none'; // Oculta a área de pesquisa
  if (!registrosData?.registros) return;

  const todasLinhas = Object.values(registrosData.registros)
    .flat()
    .sort((a, b) => parseInt(a.substring(0, 9), 10) - parseInt(b.substring(0, 9), 10));

  dom.resultado.textContent = todasLinhas
    .map((linha) => {
      const tipo = linha.substring(9, 10);
      return interpretarLinha(linha, tipo);
    })
    .join('\n');

  hideLoading(); // Oculta o overlay de carregamento
}

function interpretarLinha(linha, tipo) {
  let descricao = `NSR: ${linha.substring(0, 9).trim()} - Tipo: `;

  switch (tipo) {
    case '1':
      descricao += `Cabeçalho - Data Início: ${linha.substring(206, 216)} | Data Fim: ${linha.substring(216, 226)}`;
      break;
    case '2':
      descricao += `Alteração Empresa - Razão Social: ${linha.substring(77, 227).trim()} | CNPJ: ${linha.substring(49, 63).trim()}`;
      break;
    case '3':
      descricao += `Marcação Ponto - Data: ${formatarDataHora(linha.substring(10, 34))} | CPF: ${linha.substring(34, 46).trim()}`;
      break;
    case '4':
      descricao += `Ajuste Relógio - Antes: ${formatarDataHora(linha.substring(10, 34))} | Após: ${formatarDataHora(linha.substring(34, 58))}`;
      break;
    case '5':
      const operacao = linha.substring(34, 35) === 'I' ? 'Inclusão' : linha.substring(34, 35) === 'A' ? 'Alteração' : 'Exclusão';
      descricao += `${operacao} Funcionário - Nome: ${linha.substring(47, 99).trim()} | CPF: ${linha.substring(35, 47).trim()}`;
      break;
    case '6':
      descricao += `Evento Sensível - Tipo ${linha.substring(34, 36)} | ${formatarDataHora(linha.substring(10, 34))}`;
      break;
    default:
      descricao += 'Registro desconhecido';
  }

  return descricao;
}

function formatarDataHora(dataHoraStr) {
  const [data, tempo] = dataHoraStr.split('T');
  return `${data.split('-').reverse().join('/')} ${tempo.substring(0, 8)}`;
}

// Funções auxiliares completas
function toggleSearch() {
  dom.searchArea.style.display = dom.searchArea.style.display === 'none' ? 'block' : 'none';
  dom.resultado.textContent = '';
}

function updateFileName() {
  dom.fileName.textContent = dom.fileInput.files[0]?.name || 'Nenhum arquivo selecionado';
}

function clearFile() {
  dom.fileInput.value = '';
  dom.fileName.textContent = 'Nenhum arquivo selecionado';
  dom.resultado.textContent = '';
  registrosData = {};

  // Oculta a área de pesquisa e limpa o campo de pesquisa
  dom.searchArea.style.display = 'none';
  dom.searchInput.value = '';

  // Desabilitar os botões e adicionar o tooltip
  document.querySelectorAll('.buttons button').forEach((button) => {
    button.disabled = true;
    button.classList.add('btn-disabled');
    button.setAttribute('title', 'Carregue o arquivo primeiramente'); // Adiciona o tooltip
  });
}

// Event listeners
dom.searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') performSearch();
});

function showLoading() {
  document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
  document.getElementById('loadingOverlay').style.display = 'none';
}
