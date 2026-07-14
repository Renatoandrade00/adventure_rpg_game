import * as Phaser from 'phaser';
import * as EasyStar from 'easystarjs';

export default class Pathfinder {
    private scene: Phaser.Scene;
    private player: Phaser.Physics.Arcade.Image;
    private easystar: any;
    private currentPath: {x: number, y: number}[] = [];
    private pathTarget: Phaser.Math.Vector2 | null = null;
    private pathIndex: number = 0;
    
    // Parâmetro opcional isBattling para que a lógica não interfira na batalha global se existir
    constructor(scene: Phaser.Scene, player: Phaser.Physics.Arcade.Image, levelData: number[][], acceptableTiles: number[]) {
        this.scene = scene;
        this.player = player;

        // Configuração do EasyStar (Pathfinding)
        this.easystar = new EasyStar.js();
        this.easystar.setGrid(levelData);
        this.easystar.setAcceptableTiles(acceptableTiles);

        // Registro do Clique na Tela (Pathfinding / Movimentação Mobile)
        this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            // Verifica se a cena possui controle de batalha e se ele está ativo
            const sceneAsAny = this.scene as any;
            if (sceneAsAny.isBattling) return;
            
            // Converte as coordenadas do clique para a matriz do grid (blocos de 32x32)
            const gridX = Math.floor(pointer.worldX / 32);
            const gridY = Math.floor(pointer.worldY / 32);
            const playerGridX = Math.floor(this.player.x / 32);
            const playerGridY = Math.floor(this.player.y / 32);

            // Limita o X e Y ao tamanho do mapa baseado no array levelData passado
            const maxY = levelData.length;
            const maxX = levelData[0]?.length || 0;
            if (gridX < 0 || gridX >= maxX || gridY < 0 || gridY >= maxY) return;

            // Pede pro easystar calcular a rota assincronamente
            this.easystar.findPath(playerGridX, playerGridY, gridX, gridY, (path: any) => {
                if (path && path.length > 0) {
                    this.currentPath = path;
                    this.pathIndex = 1; // Ignora o tile inicial (0) onde o player já está
                    this.moveToNextNode();
                }
            });
            this.easystar.calculate();
        });
    }

    private moveToNextNode() {
        if (this.pathIndex >= this.currentPath.length) {
            this.currentPath = [];
            this.pathTarget = null;
            if (this.player && this.player.body) {
                this.player.setVelocity(0);
            }
            return;
        }

        const node = this.currentPath[this.pathIndex];
        // Centro do tile destino (assumindo tiles 32x32)
        this.pathTarget = new Phaser.Math.Vector2(node.x * 32 + 16, node.y * 32 + 16);
        
        // Usa a física para mover na direção do ponto
        if (this.player && this.player.body) {
            this.scene.physics.moveTo(this.player, this.pathTarget.x, this.pathTarget.y, 160);
        }
    }

    /**
     * O Update deve ser chamado no loop principal da Cena informando o objeto cursors do teclado.
     */
    public update(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
        if (!cursors || !this.player) return;
        
        const sceneAsAny = this.scene as any;
        if (sceneAsAny.isBattling) return;

        const isKeyboardMoving = cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown;

        if (isKeyboardMoving) {
            // Se usar o teclado, cancela o caminho automático do mouse/mobile
            this.currentPath = [];
            this.pathTarget = null;
            this.player.setVelocity(0);

            if (cursors.left.isDown) this.player.setVelocityX(-160);
            else if (cursors.right.isDown) this.player.setVelocityX(160);

            if (cursors.up.isDown) this.player.setVelocityY(-160);
            else if (cursors.down.isDown) this.player.setVelocityY(160);
        } else {
            // Se tem uma rota de clique calculada e não encostou no teclado
            if (this.currentPath.length > 0 && this.pathTarget) {
                const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.pathTarget.x, this.pathTarget.y);
                // Se chegou perto o suficiente do centro do bloco
                if (distance < 5) {
                    this.pathIndex++;
                    this.moveToNextNode();
                }
            } else {
                // Parado
                if(this.player.body) {
                    this.player.setVelocity(0);
                }
            }
        }
    }
}
