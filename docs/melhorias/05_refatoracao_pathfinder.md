# Refatoração do Pathfinding (OOP)

## 1. O Problema Identificado
Com a adição inicial da movimentação por cliques (*Point-and-Click*) utilizando o algoritmo A-Star (`easystarjs`), notamos que o código de configuração, escuta de eventos do mouse e cálculos matemáticos no loop `update()` estava sendo duplicado em todos os mapas (`GameScene`, `MapEastScene`, `MapSouthScene`).

Além disso, cenários internos como o **Hospital** e a **Loja** haviam ficado sem essa funcionalidade, quebrando a consistência do jogo. Se essa abordagem continuasse, a criação de novos mapas se tornaria um processo doloroso e propício a bugs.

## 2. A Solução Aplicada
Para resolver isso seguindo as **Boas Práticas de Programação Orientada a Objetos (POO)** e a premissa de *Clean Code* (DRY - Don't Repeat Yourself), abstraímos toda essa mecânica.

Criamos a classe utilitária universal `Pathfinder` localizada em `frontend/src/utils/Pathfinder.ts`. 
Ela tem o propósito único de gerenciar o *Pathfinding*.

### O que a classe Pathfinder faz internamente?
- Inicializa a grade do *EasyStar*.
- Registra as colisões passadas por parâmetro (quais tiles são "pisáveis").
- Registra o evento de `pointerdown` (clique do mouse ou toque na tela).
- Previne conflitos pausando as interações se houver uma batalha ativa na cena (`isBattling`).
- Mantém um loop de atualização (`update()`) próprio, que lida simultaneamente com as setas do teclado e o movimento autônomo.

## 3. Benefícios Práticos
1. **Padronização e Correção:** O Hospital (`HospitalScene`) e a Loja (`ShopScene`) agora suportam movimentação por clique nativamente, da mesma forma que as florestas e a vila.
2. **Escalabilidade (Futuro):** Quando você decidir criar um novo mapa (ex: `DesertScene`), não precisará reescrever 50 linhas de lógica de cliques. Bastará instanciar a classe na sua cena com uma única linha:
   ```typescript
   this.pathfinder = new Pathfinder(this, this.player, levelData, [tiles_andaveis]);
   ```
   e chamar `this.pathfinder.update(this.cursors)` no loop de atualização.
3. **Código Limpo:** As cenas reduziram drásticamente seu tamanho, tornando mais fácil focar apenas no visual, diálogos e inimigos de cada mapa.
