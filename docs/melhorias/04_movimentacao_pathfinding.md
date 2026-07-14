# Movimentação Inteligente (Point-and-Click) com Pathfinding

## 1. Visão Geral
Para fornecer suporte avançado a dispositivos móveis e melhorar a acessibilidade no desktop, o sistema de movimentação do jogo foi expandido para suportar ações de toque e clique (*point-and-click*). 
Anteriormente o jogador dependia exclusivamente das setas do teclado.

## 2. Implementação do A* (A-Star)
Para evitar que o jogador ande em linha reta e fique "preso" contra árvores, pedras ou água, integramos o algoritmo de busca de caminhos (Pathfinding) utilizando a biblioteca `easystarjs`.
O funcionamento ocorre da seguinte forma:
- **Leitura do Mapa:** Em cada cenário (`GameScene`, `MapEastScene`, `MapSouthScene`), a mesma matriz numérica (`level`) que gera o visual do mapa é repassada para o `easystar`.
- **Definição de Rotas:** Informamos ao algoritmo quais "Tiles" (blocos) são andáveis em cada mapa (ex: `0` para grama, `9` para terra, `4` para chão de caverna e `11` para ponte).
- **Cálculo da Rota:** Quando a tela recebe um clique (`pointerdown`), a posição global (X,Y) é convertida em coordenadas de grade. O algoritmo traça a rota mais curta desviando dos obstáculos.
- **Movimentação Física:** O ciclo de atualização (`update`) lê o caminho gerado (vetor de nós) e move o personagem passo a passo na direção exata de cada bloco usando o motor de física do Phaser (`moveTo`).

## 3. Comportamento Híbrido (Mobile + PC)
Foi mantido o funcionamento impecável das **Setas Direcionais do Teclado**.
Para evitar conflitos, foi adotado um comportamento híbrido inteligente:
- Se o jogador estiver se movendo pelo clique do mouse e pressionar alguma seta direcional do teclado, **a rota de clique é cancelada instantaneamente** e o teclado assume o controle absoluto.
- Ao soltar as setas, o personagem para, aguardando um novo clique na tela ou um novo comando no teclado.

## 4. Otimização e Performance
A decisão por não usar algoritmos pesados focou em deixar o build leve:
- O `easystarjs` calcula a rota usando operações matemáticas simples e de forma assíncrona, evitando o congelamento da tela (`frame drops`).
- Apenas 4 direções ortogonais (cima, baixo, esquerda, direita) são priorizadas para o deslocamento físico, impedindo que o personagem fique trancado nas bordas da quina de uma árvore (*corner-cutting*).
