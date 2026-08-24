# DIO - Controle de Legendas (Chrome Extension) 🚀

Uma extensão leve e eficiente para Google Chrome (Manifest V3) que permite **ativar ou desativar facilmente as legendas** nos vídeos e bootcamps da plataforma [DIO (dio.me)](https://web.dio.me).

---

## 🎯 Por que esta extensão existe?

Na plataforma da DIO, muitas aulas e bootcamps utilizam o player **Clappr com o player do YouTube embutido**, configurado com atributos que ativam as legendas automaticamente e bloqueiam a interação direta com os controles (`pointer-events: none`).

Esta extensão resolve o problema de forma definitiva e automática:
- **Desativação automática**: Ao carregar qualquer aula ou trocar de vídeo (SPA), as legendas são desativadas de imediato.
- **Chave Liga/Desliga (ON/OFF)**: Alterne entre ocultar ou exibir legendas a qualquer momento pelo menu da extensão.
- **Sincronização em tempo real**: O efeito é instantâneo na página aberta, sem necessidade de recarregar (F5).
- **Desbloqueio de interação**: Permite interação com a área do player de vídeo.
- **Compatibilidade total**: Funciona tanto em vídeos do YouTube (via `postMessage` da YouTube Player API) quanto em players HTML5 (`<video>` e `<track>`).

---

## 📦 Como Instalar no Google Chrome (ou Brave / Edge / Opera)

Como a extensão está em formato de código aberto, você pode instalá-la em segundos via **Modo de Desenvolvedor**:

1. Faça o clone deste repositório ou baixe os arquivos para o seu computador:
   ```bash
   git clone https://github.com/SEU_USUARIO/dio-remove-subtracks.git
   ```
2. Abra o Google Chrome e acesse `chrome://extensions/` na barra de endereços.
3. No canto superior direito da página, ative a chave **"Modo do desenvolvedor"** (*Developer mode*).
4. No canto superior esquerdo, clique no botão **"Carregar sem compactação"** (*Load unpacked*).
5. Selecione a pasta deste projeto (`dio-remove-subtracks`).
6. **Pronto!** O ícone da extensão aparecerá na sua barra de extensões do Chrome.

> 💡 **Dica**: Clique no ícone de quebra-cabeça das extensões no Chrome e fixe o **DIO - Controle de Legendas** na barra superior para acesso rápido.

---

## ⚙️ Como Usar

1. Acesse o site da [DIO](https://web.dio.me) e entre em qualquer bootcamp ou aula com vídeo.
2. Por padrão, a extensão já estará ativa e as legendas serão desativadas automaticamente.
3. Para ligar ou desligar as legendas:
   - Clique no ícone da extensão na barra do navegador.
   - Use o interruptor **"Ocultar Legendas"** para ativar ou desativar.
   - A alteração é refletida no player imediatamente.

---

## 🛠️ Arquitetura do Projeto

```
dio-remove-subtracks/
├── manifest.json            # Configuração do Manifest V3 (permissões, popup e scripts)
├── popup/
│   ├── popup.html           # Interface visual do popup
│   ├── popup.css            # Estilos (Dark Theme + cores DIO)
│   └── popup.js             # Lógica de controle do switch e chrome.storage
├── content/
│   ├── content.js           # Comunicação com a YouTube Player API e HTML5 tracks
│   └── content.css          # Desbloqueio de pointer-events e ocultação CSS
├── icons/
│   ├── icon16.png           # Ícones da extensão
│   ├── icon48.png
│   ├── icon128.png
│   └── icon.svg             # Vetorial fonte
└── README.md                # Documentação
```

---

## 🧠 Como Funciona por Baixo dos Panos

1. **Comunicação com a YouTube IFrame API**:
   O `content.js` envia comandos diretos para o `contentWindow` do iframe via `postMessage`:
   ```javascript
   // Desativar legendas:
   iframe.contentWindow.postMessage(JSON.stringify({
     event: 'command',
     func: 'setOption',
     args: ['captions', 'track', {}]
   }), '*');

   // Ativar legendas:
   iframe.contentWindow.postMessage(JSON.stringify({
     event: 'command',
     func: 'setOption',
     args: ['captions', 'track', { languageCode: 'pt' }]
   }), '*');
   ```

2. **Monitoramento de Single Page Application (SPA)**:
   Utiliza um `MutationObserver` no DOM para detectar a navegação entre aulas sem recarregamento de página, reaplicando automaticamente as preferências do usuário.

3. **Persistência de Preferências**:
   Usa a API nativa `chrome.storage.sync` para sincronizar o estado da chave ON/OFF entre sessões e abas.

---

## 🤝 Contribuições

Contribuições, issues e sugestões são super bem-vindas! Sinta-se à vontade para abrir uma *Issue* ou enviar um *Pull Request*.

---

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais detalhes.
