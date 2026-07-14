# Resumo das Últimas Atualizações

## 1. Sistema de Missões e Power Points (PP)
- **Power Points (PP):** Foi adicionado um sistema de limite de ataques (PP) para as batalhas, impedindo o "spam" infinito da mesma habilidade. Cada classe possui habilidades com um custo base de PP.
- **Hospital:** Ao se curar no hospital da vila, além da Vida (HP), todos os Power Points do personagem também são restaurados ao seu limite máximo.
- **NPC Ancião (Missões):** Foi adicionado um NPC na Vila (Planícies) que pode atribuir missões ao jogador, como derrotar X slimes. 
- **Progressão de Missões:** As missões são registradas automaticamente na vitória de uma batalha e a recompensa (Ouro + EXP) pode ser coletada voltando ao NPC. O HUD principal foi atualizado para demonstrar a missão atual e seu progresso na tela do mapa.

## 2. Correções de Build no Render (Debug)
- Foi resolvido um problema crítico que impedia o *Deploy* de compilar no `Render.com`. 
- Variáveis que não eram mais utilizadas (`questUpdated` e `npcElder`) foram removidas do código Typescript para garantir que o *Linter/Compiler* do Vite aceitasse o build limpo.

## 3. Melhoria no Design das Transições de Mapas
A travessia de um mapa para o outro foi totalmente refinada para ser visualmente intuitiva, acabando com os teletransportes indesejados ao se esbarrar nas bordas da tela:
- **Vila (Planícies - GameScene):** Adição de caminhos de terra até as bordas (leste e sul), com as zonas de transição restritas estritamente aos blocos de terra.
- **Floresta (MapEastScene):** Criação de vias de terra para acessar o retorno à Vila e para entrar no mapa da Caverna ao Sul. As árvores nas bordas foram reposicionadas e apenas permitem passagem por onde existe a trilha.
- **Caverna (MapSouthScene):** Correção do problema de sobreposição de zonas ao norte. O mapa agora apresenta duas aberturas separadas escavadas nas pedras, indicando a saída à esquerda (para a Vila) e à direita (para a Floresta). 

As descrições indicativas do chão (`Vila <-`, `Caverna V`) foram ajustadas para se alinharem exatamente com essas rotas visuais.
