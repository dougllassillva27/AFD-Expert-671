/*
MIT License

Copyright (c) 2025 Douglas Silva

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
<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido. Use POST.']);
    exit;
}

if (!isset($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['erro' => 'Nenhum arquivo enviado.']);
    exit;
}

$arquivo = $_FILES['file'];
$conteudo = file_get_contents($arquivo['tmp_name']);

// Verifica e converte a codificação se necessário
if (!mb_check_encoding($conteudo, 'UTF-8')) {
    $conteudo = mb_convert_encoding($conteudo, 'UTF-8', 'ISO-8859-1');
}

$resultado = processarAFD($conteudo);
echo json_encode($resultado);

function processarAFD($data) {
    $registros = ['1' => [], '2' => [], '3' => [], '4' => [], '5' => [], '6' => []];
    $linhasInvalidas = [];
    $linhas = explode("\n", str_replace("\r", "", $data));
    $ultimaSequencia = null;

    foreach ($linhas as $linha) {
        $linha = trim($linha);
        if (empty($linha)) continue;

        $nsr = substr($linha, 0, 9);
        $tipo = substr($linha, 9, 1);
        $numeroLinha = intval($nsr);

        if ($ultimaSequencia !== null && $numeroLinha !== $ultimaSequencia + 1) {
            $linhasInvalidas[] = $linha;
        }
        $ultimaSequencia = $numeroLinha;

        if (array_key_exists($tipo, $registros)) {
            $registros[$tipo][] = $linha;
        } else {
            $linhasInvalidas[] = $linha;
        }
    }

    $cabecalho = $registros['1'][0] ?? '';
    $dataInicio = substr($cabecalho, 206, 10);
    $dataFim = substr($cabecalho, 216, 10);
    $dataHoraGeracao = trim(substr($cabecalho, 226, 24));

    $ultimoTipo2 = end($registros['2']);
    $ultimaAlteracaoEmpresa = null;

    if ($ultimoTipo2) {
        $ultimaAlteracaoEmpresa = [
            'dataHoraGravacao' => trim(substr($ultimoTipo2, 10, 24)),
            'cnpjCpfEmpregador' => trim(substr($ultimoTipo2, 49, 14)),
            'razaoSocial' => trim(substr($ultimoTipo2, 77, 150))
        ];
    }

    return [
        'registros' => $registros,
        'linhasInvalidas' => $linhasInvalidas,
        'totalLinhas' => count($linhas),
        'dataInicio' => $dataInicio,
        'dataFim' => $dataFim,
        'dataHoraGeracao' => $dataHoraGeracao,
        'ultimaAlteracaoEmpresa' => $ultimaAlteracaoEmpresa
    ];
}
?>