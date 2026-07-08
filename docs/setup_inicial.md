# Relatório de Setup Inicial: Projeto RPG

Este documento registra as atividades realizadas durante a fase de setup inicial do projeto **Adventure RPG**, garantindo que a base de código e as diretrizes de desenvolvimento estejam alinhadas com as definições de escopo e as melhores práticas de arquitetura e segurança.

## 1. Definição e Estruturação do Repositório
O projeto foi inicializado utilizando uma arquitetura modular que separa as responsabilidades entre cliente e servidor:
- **Frontend (`/frontend`)**: Desenvolvido utilizando Vite como bundler e TypeScript para tipagem estática. A lógica do jogo utiliza a engine Phaser 3, com cenas modularizadas (BootScene, GameScene, BattleScene, etc).
- **Backend (`/backend`)**: API construída em Node.js com Express.js, fornecendo endpoints de autenticação e comunicação.
- O controle de pacotes e dependências é isolado por ambiente, garantindo que o ciclo de build do Vite não afete a compilação do servidor Express.

## 2. Documentação de Requisitos e Diretrizes
O jogo foi pensado para atender aos seguintes critérios essenciais:
- Jogabilidade RPG 2D *top-down*.
- Autenticação de usuários prévia ao carregamento do Canvas.
- Interação contínua de economia (sistema de Ouro) e inventário (Poções).
- Integração ponta-a-ponta (Frontend -> Servidor Node -> Banco MongoDB).
- Layout e UI responsivos fora e dentro do Canvas do jogo.

## 3. Configuração de Inteligência e Assets
Ao longo da prototipação, os recursos visuais foram delegados à IA:
- **Geração Automática de Assets**: Todos os *sprites* (Personagens, Inimigos e Edifícios) foram desenhados e exportados via pipeline generativa de Inteligência Artificial.
- **Processamento de Imagens**: Um script de automação (`remove_bg.py`) com Pillow/Python foi embutido nas rotinas iniciais para remover o fundo sólido gerado nativamente pela IA, criando o canal "Alpha" de transparência para integrar no mapa tileado.

## 4. Controle de Versão e Deploy
O versionamento de código baseia-se nas melhores práticas de *Continuous Deployment* (CD) em ambientes gratuitos de nuvem:
- **GitHub**: Código centralizado no repositório remoto sob a *branch main*.
- **Arquivos Ignorados**: `.gitignore` rígido bloqueando dependências (`node_modules`), credenciais (`.env`) e caches de build locais.
- **Serviços em Nuvem**:
  - Render Web Service: Atrelado ao ciclo contínuo para construir a base do Node (Backend).
  - Render Static Site: Atrelado à base dist do Vite (Frontend).
  - Variáveis de ambiente configuradas isoladamente no ambiente da plataforma, mitigando exposição de secrets (`MONGO_URI`).
