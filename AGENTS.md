# Diretrizes para Agentes de IA (AGENTS.md)

Este documento define padrões arquiteturais, de código, escrita e empacotamento para agentes de IA e desenvolvedores que colaboram neste repositório.

---

## 1. Tom de Escrita e Documentação
- **Sem texto "IArizado"**: Evite excesso de emojis, frases de marketing infladas, adjetivos exagerados ("revolucionário", "robusto", "mágico") e explicações condescendentes entre parênteses.
- **Clareza e concisão**: Escreva documentações, comentários e mensagens de commit de forma direta, humana e orientada à ação.
- **Foco no usuário**: Instruções de instalação devem ser simples e sem jargões desnecessários para quem não é da área técnica.
- **Atualização da Arquitetura**: Sempre utilize o comando `tree` (ex: `tree -I ".git*|*.zip*"`) para gerar e atualizar a árvore de estrutura de arquivos no `README.md` quando houver modificações nos arquivos do projeto.

---

## 2. Arquitetura e Regras para Extensão Chrome (Manifest V3)

### A. Segurança com React / Next.js (SPA)
- A plataforma DIO utiliza Next.js com renderização SSR/SSG e hidratação no cliente.
- **Momento de Injeção**: Scripts de conteúdo devem usar `"run_at": "document_idle"`. Nunca utilize `document_start` para manipular o DOM de forma que conflite com o ciclo de hidratação do React (risco de tela branca / hydration failure).
- **Tratamento defensivo**: Qualquer manipulação de DOM ou chamada de API (`postMessage`, `chrome.storage`) deve estar envolvida em blocos `try/catch` para garantir que erros nunca afetem a aplicação hospedeira.
- **MutationObserver**: Sempre aplique *debounce* ao escutar mutações e filtre apenas nós relevantes (`iframe`, `video`, `[data-player]`).

### B. Escopo de CSS Rigoroso
- **Nunca use seletores genéricos** como `[class*="subtitle"]` ou `[class*="caption"]` no escopo global. No styled-components / Tailwind, isso pode ocultar blocos inteiros da página.
- Restrinja estilos exclusivamente a tags nativas (`::cue`), containers conhecidos de players (`[data-player]`, `.clappr-player`) e classes de controle inseridas pela extensão (`html.dio-subtitles-disabled`).

### C. Controle do Player YouTube
- A comunicação com o player do YouTube dentro do iframe deve ser feita via `postMessage`:
  - Desativar legendas: `args: ['captions', 'track', {}]`
  - Ativar legendas: `args: ['captions', 'track', { languageCode: 'pt' }]`

---

## 3. Padrão de Empacotamento e Releases (ZIP Flat)
- **Estrutura Flat na Raiz**: O arquivo `.zip` da release deve conter os arquivos (`manifest.json`, `content/`, `popup/`, `icons/`, `README.md`, `LICENSE`, `AGENTS.md`) **diretamente na raiz do arquivo compactado**.
- **Evitar subpastas na raiz do ZIP**: Ferramentas nativas do Windows ("Extrair Tudo...") criam uma pasta com o nome do arquivo. Se o ZIP contiver outra subpasta dentro, o Chrome não encontrará o `manifest.json` no primeiro nível.
- **Comando correto de empacotamento**:
  ```bash
  zip -r dio-remove-subtitles-vX.X.X.zip manifest.json content popup icons README.md LICENSE AGENTS.md
  ```

---

## 4. Padrões de Git e Histórico
- Utilize o padrão **Conventional Commits**:
  - `feat:` para novas funcionalidades.
  - `fix:` para correções de bugs.
  - `docs:` para documentação.
  - `refactor:` para melhorias de código sem mudança de comportamento.
- Evite poluir o histórico com múltiplos micro-commits desnecessários; faça squash ou rebase antes de finalizar alterações simples.

---

## 5. Princípios de Acessibilidade e IHC
- Respeite a **Heurística de Nielsen nº 3 (Controle e Liberdade do Usuário)**: A extensão deve sempre permitir ativar e desativar recursos facilmente.
- Considere a **acessibilidade cognitiva e neurodiversidade** (redução de carga visual e sobrecarga sensorial para pessoas no espectro autista e TDAH).
