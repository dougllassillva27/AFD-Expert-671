<!--
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
-->
<?php
include_once $_SERVER['DOCUMENT_ROOT'] . '/inc/versao.php';
$base = '/Secullum/AFD-Expert-671'; // ajuste para o caminho visível no navegador
?>

<!DOCTYPE html>
<html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Validador AFD Portaria 671" />
    <meta name="keywords" content="afd, portaria, 671, rep-c" />
    <meta name="author" content="Douglas Silva" />
    <link rel="stylesheet" href="<?= versao("$base/style.css") ?>">
    <link rel="icon" type="image/x-icon" href="favicon.ico?v=1" />
    <title>AFD Expert 671</title>
    </head>
  <body>
    <div class="container">
      <h1>AFD Expert 671</h1>

      <div id="loadingOverlay" style="display: none">
        <div class="loading-spinner"></div>
        <p>Carregando...</p>
      </div>

      <form id="uploadForm" enctype="multipart/form-data">
        <label for="file" class="label-file">Escolher arquivo</label>
        <input type="file" id="file" name="file" required onchange="updateFileName()" />
        <span id="file-name">Nenhum arquivo selecionado</span>
        <br />
        <div class="button-group">
          <button type="submit" class="btn-listar">Listar</button>
          <button type="button" class="btn-limpar" onclick="clearFile()">Limpar</button>
        </div>
        <br />
      </form>

      <div class="buttons">
        <button data-tooltip="Exibe detalhes do arquivo ou registro" onclick="showDetails()" disabled class="btn-disabled">Detalhes</button>
        <button data-tooltip="Mostrar todos os registros" onclick="filterByType('all')" disabled class="btn-disabled">Todos</button>
        <button data-tooltip="Registros do tipo 2 (Identificação da empresa no REP)" onclick="filterByType('2')" disabled class="btn-disabled">Tipo 2</button>
        <button data-tooltip="Registros do tipo 3 (Marcação de ponto para REP-C e REP-A)" onclick="filterByType('3')" disabled class="btn-disabled">Tipo 3</button>
        <button data-tooltip="Registros do tipo 4 (Ajuste do relógio)" onclick="filterByType('4')" disabled class="btn-disabled">Tipo 4</button>
        <button data-tooltip="Registros do tipo 5 (Inclusão, alteração ou exclusão de empregado no REP)" onclick="filterByType('5')" disabled class="btn-disabled">Tipo 5</button>
        <button data-tooltip="Registros do tipo 6 (Eventos sensíveis do REP)" onclick="filterByType('6')" disabled class="btn-disabled">Tipo 6</button>
        <button data-tooltip="Linhas que não atendem a nenhum tipo" onclick="filterInvalidLines()" disabled class="btn-disabled">Linhas inválidas</button>
        <button data-tooltip="Mostrar interpretação detalhada das linhas" onclick="showInterpretedLines()" disabled class="btn-disabled">Linhas interpretadas</button>
        <button data-tooltip="Pesquisar dentro do arquivo carregado" onclick="toggleSearch()" disabled class="btn-disabled">Pesquisar</button>
      </div>

      <h2>Resultado</h2>

      <div id="searchArea" style="display: none">
        <input type="text" id="searchInput" placeholder="Digite o termo de pesquisa" />
        <button id="searchButton" onclick="performSearch()">Buscar</button>
      </div>
      <pre id="resultado"></pre>
    </div>

    <script src="<?= versao("$base/script.js") ?>"></script>

  </body>
</html>
