import * as Phaser from 'phaser';
import Pathfinder from '../utils/Pathfinder';

export default class MapWestScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private enemies!: Phaser.Physics.Arcade.Group;
  private hudText!: Phaser.GameObjects.Text;
  private userData: any;
  private isBattling: boolean = false;
  private pathfinder!: Pathfinder;
  private questDialogText!: Phaser.GameObjects.Text;

  constructor() {
    super('MapWestScene');
  }

  create(data: { x?: number, y?: number }) {
    this.isBattling = false;
    this.userData = this.registry.get('user');

    // Deserto da Ruína (50x30)
    const level = [];
    for (let y = 0; y < 30; y++) {
      const row = [];
      for (let x = 0; x < 50; x++) {
        // Caminho voltando para a Vila (Leste)
        if (y >= 14 && y <= 16 && x > 45) {
            row.push(9); // Caminho livre
        }
        // Bordas e obstáculos
        else if (y === 0 || y === 29 || x === 0 || x === 49) {
          row.push(3); // Pedras nas bordas
        } else if (Math.random() < 0.1) {
          row.push(3); // Pedras espalhadas
        } else {
          row.push(9); // Chão de areia (Terra)
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
        worldLayer.setCollision([1, 2, 3, 10]);
        worldLayer.setTint(0xe6c280); // Tom amarelado/deserto
      }
    }

    const startX = data.x || 1500; 
    const startY = data.y || 480;

    this.player = this.physics.add.image(startX, startY, `class_${this.userData.characterClass}`);
    this.player.setDisplaySize(48, 48);
    this.player.setCollideWorldBounds(true);
    const tw = this.player.width;
    const th = this.player.height;
    (this.player.body as Phaser.Physics.Arcade.Body).setSize(tw * 0.4, th * 0.5);
    (this.player.body as Phaser.Physics.Arcade.Body).setOffset(tw * 0.3, th * 0.25);

    if (worldLayer) this.physics.add.collider(this.player, worldLayer);

    this.physics.world.setBounds(0, 0, 50 * 32, 30 * 32);
    this.cameras.main.setBounds(0, 0, 50 * 32, 30 * 32);
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
    
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.input.keyboard.on('keydown-ENTER', () => {
          if (this.isBattling) return;
          this.physics.pause();
          this.scene.pause();
          this.scene.launch('MenuScene', { user: this.userData, currentMapScene: 'MapWestScene', x: this.player.x, y: this.player.y });
      });
    }

    this.pathfinder = new Pathfinder(this, this.player, level, [9]);

    this.events.on('resume', (_sys: any, data: any) => {
        if (data && data.menuUpdate) {
            this.userData = this.registry.get('user');
            this.hudText.setText(this.getHUDString());
            this.physics.resume();
            return;
        }

        if (data && data.result === 'win' && data.enemy) {
            data.enemy.destroy();
        }
        this.userData = this.registry.get('user');
        this.hudText.setText(this.getHUDString());
        this.isBattling = false;
        this.physics.resume();
        if (this.player && this.player.body) this.player.setVelocity(0);
    });

    // Portal (Direita / Leste)
    const portalEast = this.add.zone(50 * 32 - 16, 15 * 32 + 16, 32, 3 * 32);
    this.physics.add.existing(portalEast, true);
    this.physics.add.overlap(this.player, portalEast, () => this.changeMap('GameScene', 64, this.player.y), undefined, this);
    this.add.text(50 * 32 - 100, 15 * 32 - 32, 'Vila ->', { fontSize: '18px', color: '#fff', backgroundColor: '#000' }).setOrigin(0.5);

    // Inimigos do Deserto
    this.enemies = this.physics.add.group();
    const numEnemies = Phaser.Math.Between(8, 12);
    const enemyTypes = [
        { key: 'enemy_zombie', level: 7 },
        { key: 'enemy_scorpion', level: 8 },
        { key: 'enemy_basilisk', level: 12 }
    ];

    for (let i = 0; i < numEnemies; i++) {
        let validPos = false;
        let x = 0;
        let y = 0;
        while(!validPos) {
            x = Phaser.Math.Between(100, 1400);
            y = Phaser.Math.Between(100, 800);
            const tile = worldLayer?.getTileAtWorldXY(x, y);
            if (!tile || tile.index === 9) validPos = true;
        }
        const enemyConfig = Phaser.Math.RND.pick(enemyTypes);
        const enemy = this.enemies.create(x, y, enemyConfig.key) as Phaser.Physics.Arcade.Image;
        enemy.setData('level', enemyConfig.level);
        enemy.setData('name', enemyConfig.key.replace('enemy_', ''));
        enemy.setDisplaySize(48, 48);
        enemy.setCollideWorldBounds(true);
        enemy.setBounce(1); 
        
        const ew = enemy.width;
        const eh = enemy.height;
        (enemy.body as Phaser.Physics.Arcade.Body).setSize(ew * 0.5, eh * 0.5);
        (enemy.body as Phaser.Physics.Arcade.Body).setOffset(ew * 0.25, eh * 0.25);
        
        if (Math.random() > 0.3) enemy.setVelocity(Phaser.Math.Between(-50, 50) || 30, Phaser.Math.Between(-50, 50) || 30);
    }

    if (worldLayer) this.physics.add.collider(this.enemies, worldLayer);
    this.physics.add.overlap(this.player, this.enemies, this.onMeetEnemy, undefined, this);

    // NPC Caçador de Tesouros
    this.add.image(1400, 400, 'npc_treasure_hunter').setDisplaySize(48, 48);
    this.add.text(1400, 360, 'Caçador', { fontSize: '14px', color: '#000', backgroundColor: '#fff', padding: {x: 2, y: 2} }).setOrigin(0.5);
    
    this.questDialogText = this.add.text(this.cameras.main.centerX, this.cameras.main.height - 50, '', { 
        fontSize: '16px', color: '#fff', backgroundColor: '#34495e', padding: {x: 10, y: 10}, align: 'center', fixedWidth: 400
    }).setOrigin(0.5).setVisible(false).setScrollFactor(0);

    const npcZone = this.add.zone(1400, 400, 80, 80);
    this.physics.add.existing(npcZone, true);
    this.physics.add.overlap(this.player, npcZone, this.onMeetNPC, undefined, this);

    this.hudText = this.add.text(10, 10, this.getHUDString(), {
        fontSize: '16px', fontFamily: 'Courier New', color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.7)', padding: { x: 8, y: 8 }
    }).setScrollFactor(0);
  }

  private changeMap(targetScene: string, targetX: number, targetY: number) {
      if(this.isBattling) return;
      this.isBattling = true;
      this.scene.start(targetScene, { x: targetX, y: targetY });
  }

  private onMeetNPC() {
      if (!this.userData.quests) this.userData.quests = [];
      let quest = this.userData.quests.find((q: any) => q.title === 'O Tesouro Perdido');

      if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
          if (!quest) {
              quest = { id: 2, type: 'kill', target: 'enemy_scorpion', goal: 4, progress: 0, status: 'active', title: 'O Tesouro Perdido' };
              this.userData.quests.push(quest);
              this.registry.set('user', this.userData);
              this.showDialog('Minha carga caiu! Mate 4 Escorpiões\npara eu recuperar meu tesouro!');
          } else if (quest.status === 'active') {
              this.showDialog(`Faltam ${quest.goal - quest.progress} Escorpiões.`);
          } else if (quest.status === 'ready') {
              quest.status = 'completed';
              this.userData.gold += 150;
              this.userData.exp += 80;
              this.registry.set('user', this.userData);
              this.showDialog('Maravilha! Pegue estes 150 de Ouro e 80 de Exp.');
          }
          this.hudText.setText(this.getHUDString());
      }
  }

  private showDialog(text: string) {
      this.questDialogText.setText(text);
      this.questDialogText.setVisible(true);
      this.time.delayedCall(3000, () => this.questDialogText.setVisible(false));
  }

  private onMeetEnemy(_player: any, enemy: any) {
    if (this.isBattling) return;
    this.isBattling = true;
    this.physics.pause();
    this.scene.pause();
    this.scene.launch('BattleScene', { 
        user: this.userData, enemy: enemy, bgColor: '#b8860b', // Cor mostarda escura
        enemyLevel: enemy.getData('level'), enemyName: enemy.getData('name'), enemyKey: enemy.texture.key
    });
  }

  private getHUDString(): string {
      let questStr = '';
      if (this.userData.quests && this.userData.quests.length > 0) {
          const q = this.userData.quests.find((q: any) => q.status === 'active' || q.status === 'ready');
          if (q) questStr = ` | Missão: ${q.title} (${q.progress}/${q.goal})${q.status === 'ready' ? ' [PRONTA]' : ''}`;
      }
      return `${this.userData.username} [${this.userData.characterClass}] - Lvl: ${this.userData.level} | Exp: ${this.userData.exp} | Ouro: ${this.userData.gold} | HP: ${this.userData.hp}/${this.userData.maxHp}${questStr}`;
  }

  update() {
    if (!this.cursors || !this.player || this.isBattling) return;
    this.pathfinder.update(this.cursors);
  }
}
