# Expansão de Conteúdo (Biomas, Inimigos e NPCs)

## Resumo das Alterações
O jogo recebeu uma expansão massiva de conteúdo transformando-o em uma experiência RPG mais completa, adicionando novos mapas temáticos, novos inimigos com progressão de níveis, missões, e um chefe final.

### 1. Novos Mapas (Biomas)
Foram adicionados 3 novos cenários interligados à Vila (`GameScene`) e à Caverna (`MapSouthScene`):
- **MapWestScene (Deserto da Ruína):** Bioma árido contendo Escorpiões Gigantes, Zumbis do Deserto e Basiliscos.
- **MapNorthScene (Montanhas Nevadas):** Bioma gelado contendo Yetis e Trolls de Gelo.
- **DungeonScene (Castelo das Trevas):** Bioma de masmorra contendo Ciclopes, Liches, Behemoths e o chefe Rei Demônio. Acessado no fundo da Caverna.

### 2. Ampliação do Bestiário (10 Novos Inimigos)
Através de inteligência artificial, foram geradas 10 novas artes de sprites em pixel art (64x64) para povoar os novos mapas e garantir progressão para jogadores de alto nível:
1. Zombie (Nível 7)
2. Scorpion (Nível 8)
3. Yeti (Nível 9)
4. Ice Troll (Nível 10)
5. Basilisk (Nível 12)
6. Manticore (Nível 14)
7. Cyclops (Nível 15)
8. Lich (Nível 17)
9. Behemoth (Nível 19)
10. Demon King (Boss Nível 25)

### 3. Novos NPCs e Sistema de Missões Expandido
Adicionamos 4 novos NPCs únicos espalhados pelo mundo, cada um oferecendo uma missão (`Quest`) específica integrada ao sistema de salvamento do jogo.
- **Guarda da Fronteira (MapNorthScene):** Pede para eliminar 5 Yetis em troca de Ouro e Experiência.
- **Caçador de Tesouros (MapWestScene):** Pede para limpar a área de 4 Escorpiões Gigantes.
- **Cavaleiro Real (DungeonScene):** Encarrega o jogador da "Batalha Final" contra o Rei Demônio.
- **Mago Exilado (MapEastScene):** (Espaço reservado para futura expansão / busca de reagentes).

### 4. Refinamento de Código (POO)
- Os novos mapas instanciam a classe `Pathfinder` já existente (`this.pathfinder = new Pathfinder(...)`) garantindo movimentação híbrida (Click/Toque e Teclado) de forma otimizada, respeitando os princípios de Orientação a Objetos.
- Os novos tipos de Tiles e camadas (`worldLayer`) colidem perfeitamente com os inimigos gerados, utilizando a engine física do Phaser (Arcade Physics).
