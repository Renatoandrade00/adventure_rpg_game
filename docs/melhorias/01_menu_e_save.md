# Melhoria 01: Menu In-game e Sistema de Save

**Data:** 08 de Julho de 2026

## O que foi implementado?

Foi desenvolvido um Menu In-game interativo e um sistema de persistência de dados para salvar o progresso do jogador na nuvem (MongoDB).

## 1. Menu In-Game
- O jogador agora pode acessar um Menu Principal a qualquer momento apertando a tecla **ENTER** fora de combate.
- O jogo inteiro congela em segundo plano (`physics.pause()` e `scene.pause()`) enquanto o menu é renderizado por cima.
- Funcionalidades do menu:
    - **Mochila:** Exibe quantas poções o jogador possui e permite utilizá-las caso o HP não esteja no máximo. Ao usar, o jogador recupera 15 de HP instantaneamente e a variável é sincronizada.
    - **Salvar Jogo na Nuvem:** Faz uma requisição `POST` para o backend para persistir todos os dados, além das coordenadas atuais.
    - **Voltar ao Jogo:** Fecha o menu com segurança, seja clicando no botão ou apertando `ESC`.

## 2. Sistema de Save (Persistência)
Para garantir que o jogador possa retomar a partida de onde parou, o Banco de Dados e os Endpoints do Express.js foram expandidos:
- **Novos Campos (`User.ts`):** `currentScene`, `lastX` e `lastY`.
- **Backend:** 
    - No `/api/register`, os novos heróis são inseridos apontando automaticamente para a `GameScene` nas coordenadas (160, 160).
    - No `/api/login`, esses dados são recuperados e retornados para o jogo.
    - O endpoint `/api/save` agora aceita a cena atual e a coordenada para atualizar na base de dados (`findOneAndUpdate`).
- **Frontend (`main.ts` / `BootScene.ts`):**
    - Durante a transição inicial, após baixar as artes, a `BootScene` verifica a `currentScene` e inicia a cena correta já posicionando o herói no local exato do mapa que ele parou de jogar (através de `userData.lastX` e `userData.lastY`).
    - Assim, o mundo se torna persistente entre os logins!

## Impacto na Jogabilidade
Com a persistência de mundo e inventário fora de batalha, criamos a infraestrutura ideal para escalar o jogo, permitindo mapas gigantes e exploração profunda de dezenas de horas.
