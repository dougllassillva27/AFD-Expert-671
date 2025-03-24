# Analisador de Arquivo AFD Portaria 671

![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)

Este repositório contém um projeto que analisa e valida arquivos AFD (Arquivo Fonte de Dados) conforme a Portaria 671. O AFD é um arquivo gerado por equipamentos de registro de ponto (REP-C) e contém informações sobre as marcações de ponto dos funcionários, ajustes de relógio, eventos sensíveis, entre outros dados.

O projeto consiste em uma aplicação web que permite o upload de um arquivo AFD, realiza a análise do conteúdo e exibe os registros de forma organizada, além de identificar linhas inválidas e fornecer detalhes sobre o arquivo.

## Funcionalidades

- **Upload de arquivo AFD**: Permite o upload de um arquivo AFD no formato texto.
- **Detalhes do arquivo**: Exibe informações gerais sobre o arquivo, como:
  - Número total de linhas.
  - Quantidade de registros por tipo.
  - Número serial do equipamento.
  - Data de início e fim dos eventos registrados.
  - Última alteração de empresa.
- **Análise de registros**: Classifica os registros do arquivo AFD em diferentes tipos, conforme a Portaria 671:
  - **Tipo 1**: Cabeçalho do arquivo.
  - **Tipo 2**: Identificação da empresa no REP.
  - **Tipo 3**: Marcação de ponto para REP-C e REP-A.
  - **Tipo 4**: Ajuste do relógio.
  - **Tipo 5**: Inclusão, alteração ou exclusão de empregado no REP.
  - **Tipo 6**: Eventos sensíveis do REP.
- **Detecção de linhas inválidas**: Identifica e exibe linhas que não seguem o padrão esperado no arquivo AFD.
- **Linhas Interpretadas**: Identifica e exibe as linhas do arquivo AFD de acordo com o seu tipo (Tipo 1, Tipo 2, Tipo 3, etc.), fornecendo uma interpretação detalhada e legível de cada registro. Isso facilita a análise e o entendimento dos dados contidos no arquivo.
- **Filtragem de dados**: Permite filtrar por termos de pesquisa (CPF, nome da empresa, NSR e etc).

## Como usar

- Na interface web, clique em "Escolher arquivo" para selecionar um arquivo AFD.
- Após selecionar o arquivo, clique em "Listar" para processar o arquivo e exibir os registros.
- Utilize os botões de filtro para visualizar registros específicos (Tipo 2, Tipo 3, etc.).
- Clique em "Detalhes" para ver informações gerais sobre o arquivo.
- Para limpar o arquivo e os resultados, clique em "Limpar".

### Pré-requisitos

- Node.js instalado (versão 12 ou superior).
- NPM ou Yarn para gerenciamento de dependências.

### Tecnologias Utilizadas

- HTML/CSS: Para a interface web.
- JavaScript: Para a lógica de frontend e interação com o usuário.
- Node.js: Para o backend que processa o arquivo AFD.
- Express.js: Framework para criação do servidor.
- Multer: Middleware para upload de arquivos.
- iconv-lite: Biblioteca para conversão de codificação de caracteres.

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/analisador-afd-671.git
   ```

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.
