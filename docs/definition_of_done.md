# Definition of Done (DoD) — Adventure RPG

Este documento define os critérios de qualidade obrigatórios que qualquer funcionalidade (User Story ou Task) deve atender antes de ser considerada concluída e pronta para produção no jogo **Adventure RPG**.

## 1. Código e Padrões de Projeto
- [ ] Todo o código da nova *feature* deve compilar e transpirar sem erros de Build TypeScript (`tsc`).
- [ ] Nenhuma nova dependência pesada deve ser incorporada ao `package.json` sem justificativa (Impacto no tamanho de *bundle* do Vite).
- [ ] A arquitetura deve ser respeitada: A camada de Física fica nas `Scenes` do Phaser e a comunicação com servidor (Fetch) ocorre sob demanda, preferencialmente isolada.
- [ ] Arquivos de imagens, áudio ou tilesets estão registrados adequadamente no `BootScene.ts`.

## 2. Testes e Qualidade
- [ ] Novas telas do jogo ou do sistema Web (`index.html`) foram renderizadas e visualmente inspecionadas no navegador.
- [ ] A funcionalidade implementada não quebrou os estados ou as transições das Cenas do Phaser (Ex: Sobreposição ou "overlap" indevido de mapas físicos).
- [ ] Eventos assíncronos (como chamadas à API em `BattleScene` ou salvamento na nuvem) gerenciam estados de "loading" ou garantem integridade em caso de quedas de conexão.

## 3. Segurança e Banco de Dados (MongoDB)
- [ ] Quaisquer modificações e persistências de dados dos usuários no Banco obedecem às limitações e proteções do Schema (Ex: Tipagem estrita no Mongoose em `User.ts`).
- [ ] Ouro e Experiência não possuem lógica vulnerável no *client-side* que possa ser modificada por *cheat/hack* simplista no DevTools do navegador.
- [ ] Nenhuma "Secret Key", "Senha de DB" ou URL Externa da API subiu acidentalmente descrita no código. Tudo foi passado para Variáveis de Ambiente (`VITE_API_URL`, `MONGO_URI`, `PORT`).

## 4. Entrega e Versionamento
- [ ] O código modificado foi comitado para a *branch main* no GitHub e está atualizado no repositório `Renatoandrade00/adventure_rpg_game`.
- [ ] O Webhook do GitHub com o Render.com foi engatilhado com sucesso, e a compilação nos Logs da nuvem não demonstrou falhas de *Build* do React/Vite.
- [ ] A página no endereço Live e Público foi checada para aferir a propagação de Cache e carregar a última versão.
