import * as Phaser from 'phaser';

export default class MapEastScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private enemies!: Phaser.Physics.Arcade.Group;
  private hudText!: Phaser.GameObjects.Text;
  private userData: any;
  private isBattling: boolean = false;

  constructor() {
    super('MapEastScene');
  }

  create(data: { x?: number, y?: number }) {
    this.userData = this.registry.get('user');

    // 1. Criação do Mapa (Floresta Profunda - 50x30)
    const level = [];
    for (let y = 0; y < 30; y++) {
      const row = [];
      for (let x = 0; x < 50; x++) {
        if (y === 0 || y === 29 || x === 49) {
          row.push(1); // Bordas em cima, baixo e direita
        } else if (Math.random() < 0.15) {
          row.push(1); // Mais pedras/árvores na floresta
        } else {
          row.push(0); // Grama
        }
      }
      level.push(row);
    }

    const map = this.make.tilemap({ data: level, tileWidth: 32, tileHeight: 32 });
    const tileset = map.addTilesetImage('tiles', 'tiles', 32, 32, 0, 0);
    
    let worldLayer: any = null;
    if (tileset) {
      worldLayer = map.createLayer(0, tileset, 0, 0);
      if (worldLayer) {
        worldLayer.setCollision(1);
        worldLayer.setTint(0x99aa99); // Deixa a cor um pouco mais escura (Floresta profunda)
      }
    }

    // 2. Criação do Jogador
    const textureName = `class_${this.userData.characterClass}`;
    
    // Posição inicial (vem do portal, senão padrão)
    const startX = data.x || 32; 
    const startY = data.y || 400;

    this.player = this.physics.add.image(startX, startY, textureName);
    this.player.setDisplaySize(48, 48);
    this.player.setCollideWorldBounds(true);

    if (worldLayer) {
      this.physics.add.collider(this.player, worldLayer);
    }

    this.physics.world.setBounds(0, 0, 50 * 32, 30 * 32);
    this.cameras.main.setBounds(0, 0, 50 * 32, 30 * 32);
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
    
    if (this.input.keyboard) {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    // Portal para voltar ao mapa inicial (Esquerda)
    const portalWest = this.add.zone(32, 15 * 32, 64, 30 * 32);
    this.physics.add.existing(portalWest, true);
    this.physics.add.overlap(this.player, portalWest, () => this.changeMap('GameScene', 48 * 32, this.player.y), undefined, this);

    // Portal para ir pro Sul a partir daqui
    const portalSouth = this.add.zone(25 * 32, 30 * 32 - 32, 50 * 32, 64);
    this.physics.add.existing(portalSouth, true);
    this.physics.add.overlap(this.player, portalSouth, () => this.changeMap('MapSouthScene', this.player.x, 64), undefined, this);

    this.add.text(100, 15 * 32, '<- Planícies', { fontSize: '18px', color: '#fff', backgroundColor: '#000' }).setOrigin(0.5);
    this.add.text(25 * 32, 30 * 32 - 100, 'Caverna (Perigo) V', { fontSize: '18px', color: '#ff0000', backgroundColor: '#000' }).setOrigin(0.5);


    // 4. Inimigos (Nível Médio)
    this.enemies = this.physics.add.group();
    
    const numEnemies = Phaser.Math.Between(8, 15);
    const enemyTypes = [
        { key: 'enemy_goblin', level: 2 },
        { key: 'enemy_wolf', level: 3 },
        { key: 'enemy_bat', level: 3 },
        { key: 'enemy_skeleton', level: 4 },
        { key: 'enemy_orc', level: 5 },
        { key: 'enemy_spider', level: 6 }
    ];

    for (let i = 0; i < numEnemies; i++) {
        const x = Phaser.Math.Between(100, 1500);
        const y = Phaser.Math.Between(100, 800);
        
        const typeInfo = Phaser.Math.RND.pick(enemyTypes);
        
        const enemy = this.enemies.create(x, y, typeInfo.key) as Phaser.Physics.Arcade.Image;
        enemy.setData('level', typeInfo.level);
        enemy.setData('name', typeInfo.key.replace('enemy_', ''));

        enemy.setDisplaySize(48, 48);
        enemy.setCollideWorldBounds(true);
        enemy.setBounce(1); 
        
        if (Math.random() > 0.3) {
            enemy.setVelocity(Phaser.Math.Between(-50, 50) || 30, Phaser.Math.Between(-50, 50) || 30);
        }
    }

    if (worldLayer) {
        this.physics.add.collider(this.enemies, worldLayer);
    }
    
    this.physics.add.overlap(this.player, this.enemies, this.onMeetEnemy, undefined, this);

    // 5. HUD
    const hudTextString = `${this.userData.username} [${this.userData.characterClass}] - Lvl: ${this.userData.level} | Exp: ${this.userData.exp} | Ouro: ${this.userData.gold} | HP: ${this.userData.hp}/${this.userData.maxHp}`;
    this.hudText = this.add.text(10, 10, hudTextString, {
        fontSize: '16px', fontFamily: 'Courier New', color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.7)', padding: { x: 8, y: 8 }
    });
    this.hudText.setScrollFactor(0);

    // 6. Retorno da Batalha
    this.events.on('resume', (_scene: any, data: any) => {
        if (data && data.result === 'win' && data.enemy) {
            data.enemy.destroy();
        }
        this.userData = this.registry.get('user');
        this.hudText.setText(`${this.userData.username} [${this.userData.characterClass}] - Lvl: ${this.userData.level} | Exp: ${this.userData.exp} | Ouro: ${this.userData.gold} | HP: ${this.userData.hp}/${this.userData.maxHp}`);
        
        this.isBattling = false;
        this.physics.resume();
        if (this.player && this.player.body) this.player.setVelocity(0);
    });
  }

  private changeMap(targetScene: string, targetX: number, targetY: number) {
      if(this.isBattling) return;
      this.isBattling = true; // Para evitar chamas múltiplas
      this.scene.start(targetScene, { x: targetX, y: targetY });
  }

  private onMeetEnemy(_player: any, enemy: any) {
    if (this.isBattling) return;
    this.isBattling = true;

    this.physics.pause();
    this.scene.pause();
    this.scene.launch('BattleScene', { 
        user: this.userData, 
        enemy: enemy,
        bgColor: '#1a3320', // Cor mais escura pra floresta profunda
        enemyLevel: enemy.getData('level'),
        enemyName: enemy.getData('name'),
        enemyKey: enemy.texture.key
    });
  }

  update() {
    if (!this.cursors || !this.player || this.isBattling) return;

    this.player.setVelocity(0);

    if (this.cursors.left.isDown) this.player.setVelocityX(-160);
    else if (this.cursors.right.isDown) this.player.setVelocityX(160);

    if (this.cursors.up.isDown) this.player.setVelocityY(-160);
    else if (this.cursors.down.isDown) this.player.setVelocityY(160);
  }
}
