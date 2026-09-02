# DIO - Controle de Legendas

[![Pair Programmed with Google Antigravity](https://img.shields.io/badge/Pair%20Programmed%20with-Google%20Antigravity-8B5CF6?style=for-the-badge&logo=google&logoColor=white)](https://github.com/joao-m-csilva/dio-remove-subtitles)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

Extensão para Google Chrome (Manifest V3) que permite desativar ou ativar legendas nos vídeos e cursos da DIO ([dio.me](https://web.dio.me)).

## O que a extensão faz

Muitos cursos da DIO utilizam o player do YouTube embutido com legendas ativadas por padrão e controles nativos bloqueados (`pointer-events: none`). Esta extensão:

- Desativa as legendas automaticamente ao iniciar os vídeos.
- Oferece um menu popup com botão liga/desliga para alternar a exibição a qualquer momento.
- Desbloqueia a área do player para permitir cliques e interação com o vídeo.
- Funciona em navegação de página única (SPA), aplicando a preferência ao trocar de aula sem precisar recarregar a página.
- Mantém sua preferência salva no navegador.

## Instalação

### Opção 1: Download via ZIP

1. Baixe o arquivo da extensão: [dio-remove-subtitles-v1.0.1.zip](https://github.com/joao-m-csilva/dio-remove-subtitles/releases/download/v1.0.1/dio-remove-subtitles-v1.0.1.zip)
2. Extraia o arquivo `.zip` no seu computador.
3. No Chrome, acesse `chrome://extensions/`.
4. Ative a opção **Modo do desenvolvedor** (canto superior direito).
5. Clique em **Carregar sem compactação** (canto superior esquerdo) e selecione a pasta extraída.

### Opção 2: Via Git

```bash
git clone https://github.com/joao-m-csilva/dio-remove-subtitles.git
```
No Chrome, acesse `chrome://extensions/`, clique em **Carregar sem compactação** e selecione a pasta do projeto.

## Como usar

1. Abra qualquer aula com vídeo na DIO.
2. As legendas serão desativadas automaticamente.
3. Para ativar ou desativar manualmente, clique no ícone da extensão na barra do navegador e alterne a chave.

## Estrutura do projeto

```text
dio-remove-subtitles/
├── AGENTS.md
├── LICENSE
├── README.md
├── manifest.json
├── content/
│   ├── content.css
│   └── content.js
├── icons/
│   ├── icon.svg
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── popup/
    ├── popup.css
    ├── popup.html
    └── popup.js
```

## Desenvolvimento e IHC

Projeto desenvolvido aplicando conceitos de Interação Humano-Computador (IHC) — em especial a Heurística de Controle do Usuário e a Lei de Fitts — em pair programming com o **Google Antigravity**.

## Licença

[MIT](LICENSE)

---

> *"O valor de construir o seu próprio software não está apenas no resultado final que roda na tela, mas na reconfiguração física que acontece no seu cérebro durante o processo de criação."*

