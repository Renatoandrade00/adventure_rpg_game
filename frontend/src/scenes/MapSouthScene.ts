import * as Phaser from 'phaser';
import Pathfinder from '../utils/Pathfinder';

export default class MapSouthScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private enemies!: Phaser.Physics.Arcade.Group;
  private hudText!: Phaser.GameObjects.Text;
  private userData: any;
  private isBattling: boolean = false;
  private pathfinder!: Pathfinder;

  constructor() {
    super('MapSouthScene');
  }

  create(data: { x?: number, y?: number }) {
    this.isBattling = false;
    this.userData = this.registry.get('user');

    // 1. Criação do Mapa (Caverna Profunda - 50x30)
    const level = [];
    for (let y = 0; y < 30; y++) {
      const row = [];
      for (let x = 0; x < 50; x++) {
        // Caminho Norte (Vila)
        if (x >= 24 && x <= 26 && y < 4) {
            row.push(4); // Chão de caverna para passagem
        }
        // Caminho Sul (Dungeon)
        else if (x >= 24 && x <= 26 && y > 25) {
            row.push(4); // Chão de caverna para passagem
        }
        else if (y === 0 || y === 29 || x === 0 || x === 49) {
          row.push(3); // Parede da caverna
        } else if (Math.random() < 0.2) {
          row.push(3); // Pedras (obstáculos)
        } else {
          row.push(4); // Chão de caverna
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
        worldLayer.setCollision([1, 2, 3]);
        worldLayer.setTint(0x555555); // Escurece muito para parecer caverna
      }
    }


    // 2. Criação do Jogador
    const textureName = `class_${this.userData.characterClass}`;
    
    const startX = data.x || 400; 
    const startY = data.y || 32;

    this.player = this.physics.add.image(startX, startY, textureName);
    this.player.setDisplaySize(48, 48);
    this.player.setCollideWorldBounds(true);

    const tw = this.player.width;
    const th = this.player.height;
    (this.player.body as Phaser.Physics.Arcade.Body).setSize(tw * 0.4, th * 0.5);
    (this.player.body as Phaser.Physics.Arcade.Body).setOffset(tw * 0.3, th * 0.25);

    if (worldLayer) {
      this.physics.add.collider(this.player, worldLayer);
    }

    this.physics.world.setBounds(0, 0, 50 * 32, 30 * 32);
    this.cameras.main.setBounds(0, 0, 50 * 32, 30 * 32);
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
    
    if (this.input.keyboard) {
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Abre o Menu In-Game
        this.input.keyboard.on('keydown-ENTER', () => {
            if (this.isBattling) return;
            this.physics.pause();
            this.scene.pause();
            this.scene.launch('MenuScene', { 
                user: this.userData, 
                currentMapScene: 'MapSouthScene', 
                x: this.player.x, 
                y: this.player.y 
            });
        });
    }

    // Instancia o controlador universal de Pathfinding
    this.pathfinder = new Pathfinder(this, this.player, level, [4]);

    // Portais (Saídas limitadas)
    const portalNorth1 = this.add.zone(12 * 32 + 16, 16, 3 * 32, 32);
    this.physics.add.existing(portalNorth1, true);
    this.physics.add.overlap(this.player, portalNorth1, () => this.changeMap('GameScene', 25 * 32, 850), undefined, this);

    const portalNorth = this.add.zone(25 * 32 + 16, 16, 3 * 32, 32);
    this.physics.add.existing(portalNorth, true);
    this.physics.add.overlap(this.player, portalNorth, () => this.changeMap('GameScene', this.player.x, 30 * 32 - 64), undefined, this);
    this.add.text(25 * 32 + 16, 64, '^ Vila', { fontSize: '18px', color: '#fff', backgroundColor: '#000' }).setOrigin(0.5);

    // Portal (Sul - Dungeon Castelo das Trevas)
    const portalSouth = this.add.zone(25 * 32 + 16, 30 * 32 - 16, 3 * 32, 32);
    this.physics.add.existing(portalSouth, true);
    this.physics.add.overlap(this.player, portalSouth, () => this.changeMap('DungeonScene', this.player.x, 64), undefined, this);
    this.add.text(25 * 32 + 16, 30 * 32 - 64, 'V Castelo', { fontSize: '18px', color: '#ff0000', backgroundColor: '#000' }).setOrigin(0.5);
    this.add.text(37 * 32 + 16, 64, '^ Floresta', { fontSize: '18px', color: '#fff', backgroundColor: '#000' }).setOrigin(0.5);


    // 4. Inimigos (Nível Alto e Chefe)
    this.enemies = this.physics.add.group();
    
    const numEnemies = Phaser.Math.Between(5, 10);
    const enemyTypes = [
        { key: 'enemy_spider', level: 4 },
        { key: 'enemy_wraith', level: 5 },
        { key: 'enemy_golem', level: 6 },
        { key: 'enemy_minotaur', level: 7 },
        { key: 'enemy_dragon', level: 10 } // Chefe/Monstro mais forte!
    ];

    for (let i = 0; i < numEnemies; i++) {
        let validPos = false;
        let x = 0;
        let y = 0;
        while(!validPos) {
            x = Phaser.Math.Between(100, 1500);
            y = Phaser.Math.Between(100, 800);
            const tile = worldLayer?.getTileAtWorldXY(x, y);
            // Anda apenas no tile 4 (chão de caverna)
            if (!tile || tile.index === 4) {
                validPos = true;
            }
        }
        
        const typeInfo = Phaser.Math.RND.pick(enemyTypes);
        
        const enemy = this.enemies.create(x, y, typeInfo.key) as Phaser.Physics.Arcade.Image;
        enemy.setData('level', typeInfo.level);
        enemy.setData('name', typeInfo.key.replace('enemy_', ''));

        enemy.setDisplaySize(54, 54); // Monstros maiores
        enemy.setCollideWorldBounds(true);
        enemy.setBounce(1); 
        
        const ew = enemy.width;
        const eh = enemy.height;
        (enemy.body as Phaser.Physics.Arcade.Body).setSize(ew * 0.5, eh * 0.5);
        (enemy.body as Phaser.Physics.Arcade.Body).setOffset(ew * 0.25, eh * 0.25);
        
        if (Math.random() > 0.3) {
            enemy.setVelocity(Phaser.Math.Between(-60, 60) || 40, Phaser.Math.Between(-60, 60) || 40);
        }
    }

    // O Grande Dragão Chefe
    const dragon = this.enemies.create(25 * 32, 15 * 32, 'enemy_dragon') as Phaser.Physics.Arcade.Image;
    dragon.setData('level', 10);
    dragon.setData('name', 'dragon');
    dragon.setDisplaySize(128, 128);
    dragon.setCollideWorldBounds(true);
    dragon.setVelocity(30, 30);
    dragon.setBounce(1);
    
    const dw = dragon.width;
    const dh = dragon.height;
    (dragon.body as Phaser.Physics.Arcade.Body).setSize(dw * 0.6, dh * 0.6);
    (dragon.body as Phaser.Physics.Arcade.Body).setOffset(dw * 0.2, dh * 0.2);

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

    // 6. Retorno da Batalha/Menu
    this.events.on('resume', (_sys: any, data: any) => {
        if (data && data.menuUpdate) {
            this.userData = this.registry.get('user');
            this.hudText.setText(`${this.userData.username} [${this.userData.characterClass}] - Lvl: ${this.userData.level} | Exp: ${this.userData.exp} | Ouro: ${this.userData.gold} | HP: ${this.userData.hp}/${this.userData.maxHp}`);
            this.physics.resume();
            return;
        }

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
      this.isBattling = true; 
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
        bgColor: '#1a1a1a', // Cor de caverna (quase preto)
        enemyLevel: enemy.getData('level'),
        enemyName: enemy.getData('name'),
        enemyKey: enemy.texture.key
    });
  }

  update() {
    if (!this.cursors || !this.player || this.isBattling) return;
    this.pathfinder.update(this.cursors);
  }
}
