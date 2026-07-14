import * as Phaser from 'phaser';
import Pathfinder from '../utils/Pathfinder';

export default class DungeonScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private enemies!: Phaser.Physics.Arcade.Group;
  private hudText!: Phaser.GameObjects.Text;
  private userData: any;
  private isBattling: boolean = false;
  private pathfinder!: Pathfinder;
  private questDialogText!: Phaser.GameObjects.Text;

  constructor() {
    super('DungeonScene');
  }

  create(data: { x?: number, y?: number }) {
    this.isBattling = false;
    this.userData = this.registry.get('user');

    // Castelo das Trevas (50x30)
    const level = [];
    for (let y = 0; y < 30; y++) {
      const row = [];
      for (let x = 0; x < 50; x++) {
        // Entrada (Norte) vindo do sul da Caverna
        if (x >= 24 && x <= 26 && y < 3) {
            row.push(4); // Chão da masmorra
        }
        else if (y === 0 || y === 29 || x === 0 || x === 49) {
          row.push(6); // Parede de tijolos
        } 
        else if (Math.random() < 0.2 && y > 5) {
          row.push(3); // Pedras de bloqueio
        } else {
          row.push(4); // Chão da masmorra
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
        worldLayer.setCollision([1, 2, 3, 6, 10]);
        worldLayer.setTint(0x550000); // Tom vermelho escuro diabólico
      }
    }

    const startX = data.x || 800; 
    const startY = data.y || 128;

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
          this.scene.launch('MenuScene', { user: this.userData, currentMapScene: 'DungeonScene', x: this.player.x, y: this.player.y });
      });
    }

    this.pathfinder = new Pathfinder(this, this.player, level, [4]);

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

    // Portal (Norte -> volta pra caverna)
    const portalNorth = this.add.zone(25 * 32 + 16, 16, 3 * 32, 32);
    this.physics.add.existing(portalNorth, true);
    this.physics.add.overlap(this.player, portalNorth, () => this.changeMap('MapSouthScene', this.player.x, 30 * 32 - 64), undefined, this);
    this.add.text(25 * 32 + 16, 64, '^ Caverna', { fontSize: '18px', color: '#fff', backgroundColor: '#000' }).setOrigin(0.5);

    // Inimigos da Dungeon
    this.enemies = this.physics.add.group();
    const numEnemies = Phaser.Math.Between(6, 10);
    const enemyTypes = [
        { key: 'enemy_cyclops', level: 15 },
        { key: 'enemy_lich', level: 17 },
        { key: 'enemy_behemoth', level: 19 }
    ];

    for (let i = 0; i < numEnemies; i++) {
        let validPos = false;
        let x = 0;
        let y = 0;
        while(!validPos) {
            x = Phaser.Math.Between(100, 1400);
            y = Phaser.Math.Between(300, 800);
            const tile = worldLayer?.getTileAtWorldXY(x, y);
            if (!tile || tile.index === 4) validPos = true;
        }
        const enemyConfig = Phaser.Math.RND.pick(enemyTypes);
        const enemy = this.enemies.create(x, y, enemyConfig.key) as Phaser.Physics.Arcade.Image;
        enemy.setData('level', enemyConfig.level);
        enemy.setData('name', enemyConfig.key.replace('enemy_', ''));
        enemy.setDisplaySize(56, 56);
        enemy.setCollideWorldBounds(true);
        enemy.setBounce(1); 
        
        const ew = enemy.width;
        const eh = enemy.height;
        (enemy.body as Phaser.Physics.Arcade.Body).setSize(ew * 0.5, eh * 0.5);
        (enemy.body as Phaser.Physics.Arcade.Body).setOffset(ew * 0.25, eh * 0.25);
        
        if (Math.random() > 0.3) enemy.setVelocity(Phaser.Math.Between(-50, 50) || 30, Phaser.Math.Between(-50, 50) || 30);
    }

    // O Rei Demônio (Chefe)
    const boss = this.enemies.create(800, 850, 'enemy_demon_king') as Phaser.Physics.Arcade.Image;
    boss.setData('level', 25);
    boss.setData('name', 'Rei Demônio');
    boss.setDisplaySize(80, 80);
    boss.setCollideWorldBounds(true);
    (boss.body as Phaser.Physics.Arcade.Body).setSize(40, 40);
    this.add.text(800, 800, 'Rei Demônio', { fontSize: '18px', color: '#ff0000', fontStyle: 'bold' }).setOrigin(0.5);

    if (worldLayer) this.physics.add.collider(this.enemies, worldLayer);
    this.physics.add.overlap(this.player, this.enemies, this.onMeetEnemy, undefined, this);

    // NPC Cavaleiro
    this.add.image(800, 200, 'npc_royal_knight').setDisplaySize(48, 48);
    this.add.text(800, 160, 'Cavaleiro', { fontSize: '14px', color: '#000', backgroundColor: '#fff', padding: {x: 2, y: 2} }).setOrigin(0.5);
    
    this.questDialogText = this.add.text(this.cameras.main.centerX, this.cameras.main.height - 50, '', { 
        fontSize: '16px', color: '#fff', backgroundColor: '#34495e', padding: {x: 10, y: 10}, align: 'center', fixedWidth: 400
    }).setOrigin(0.5).setVisible(false).setScrollFactor(0);

    const npcZone = this.add.zone(800, 200, 80, 80);
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
      let quest = this.userData.quests.find((q: any) => q.title === 'A Batalha Final');

      if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
          if (!quest) {
              quest = { id: 4, type: 'kill', target: 'enemy_demon_king', goal: 1, progress: 0, status: 'active', title: 'A Batalha Final' };
              this.userData.quests.push(quest);
              this.registry.set('user', this.userData);
              this.showDialog('Guerreiro, o Rei Demônio espreita nas sombras!\nMate-o e salve nosso mundo!');
          } else if (quest.status === 'active') {
              this.showDialog(`Ele ainda vive. Vá até o fim da sala!`);
          } else if (quest.status === 'ready') {
              quest.status = 'completed';
              this.userData.gold += 1000;
              this.userData.exp += 1000;
              this.registry.set('user', this.userData);
              this.showDialog('VOCÊ SALVOU O MUNDO! Pegue 1000 de Ouro e Exp.\n(Fim de Jogo?)');
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
        user: this.userData, enemy: enemy, bgColor: '#110000', // Escuridão e Sangue
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
