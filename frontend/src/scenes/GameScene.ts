import * as Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private slimes!: Phaser.Physics.Arcade.Group;
  private hudText!: Phaser.GameObjects.Text;
  private userData: any;
  private isBattling: boolean = false;
  private hospitalZone!: Phaser.GameObjects.Zone;

  constructor() {
    super('GameScene');
  }

  create() {
    // Carrega dados do usuário (se não tiver, usa padrão de teste)
    this.userData = this.registry.get('user') || { username: 'Convidado', characterClass: 'Guerreiro', level: 1, exp: 0, hp: 25, maxHp: 25 };
    if(this.userData.hp === undefined) {
        this.userData.hp = 25;
        this.userData.maxHp = 25;
    }

    // 1. Criação do Mapa
    const level = [];
    for (let y = 0; y < 30; y++) {
      const row = [];
      for (let x = 0; x < 50; x++) { // Aumentei o mapa para 50x30
        if (y === 0 || y === 29 || x === 0 || x === 49) {
          row.push(1); // Bordas
        } else if (x === 20 && y > 10 && y < 20) {
          row.push(1); // Muro dividindo Vila e Floresta
        } else if (Math.random() < 0.1 && x > 20) {
          row.push(1); // Pedras apenas na Floresta
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
      }
    }

    // 2. Criação do Jogador
    const textureName = `class_${this.userData.characterClass}`;
    this.player = this.physics.add.image(160, 160, textureName);
    this.player.setDisplaySize(48, 48); // Tamanho aumentado do personagem
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

    // 4. Inimigos (Slimes)
    this.slimes = this.physics.add.group();
    
    // Espalha de 5 a 10 slimes pelo mapa
    const numSlimes = Phaser.Math.Between(5, 10);
    for (let i = 0; i < numSlimes; i++) {
        // Posição na "Floresta" (lado direito do mapa, x > 650)
        const x = Phaser.Math.Between(700, 1500);
        const y = Phaser.Math.Between(100, 800);
        const slime = this.slimes.create(x, y, 'enemy_slime') as Phaser.Physics.Arcade.Image;
        slime.setDisplaySize(32, 32);
        slime.setCollideWorldBounds(true);
        slime.setBounce(1); // Faz o slime quicar suavemente nas paredes se ele estiver se movendo
        
        // Define se este slime andará ou ficará parado
        const isMoving = Math.random() > 0.5;
        if (isMoving) {
            const velX = Phaser.Math.Between(-40, 40) || 20; // Previne velocidade 0
            const velY = Phaser.Math.Between(-40, 40) || 20;
            slime.setVelocity(velX, velY);
        }
    }

    if (worldLayer) {
        this.physics.add.collider(this.slimes, worldLayer);
    }
    
    // Colisão do jogador com o slime (overlap = apenas detecta mas não impede movimento físico 100%)
    this.physics.add.overlap(this.player, this.slimes, this.onMeetEnemy, undefined, this);

    // 4.5. Hospital e Loja (Na Vila)
    this.add.image(350, 90, 'hospital_building').setDisplaySize(128, 128);
    this.hospitalZone = this.add.zone(350, 140, 64, 32); // Porta embaixo do prédio
    this.physics.add.existing(this.hospitalZone, true);
    this.physics.add.overlap(this.player, this.hospitalZone, this.onEnterHospital, undefined, this);

    this.add.image(350, 270, 'shop_building').setDisplaySize(128, 128);
    const shopZone = this.add.zone(350, 320, 64, 32);
    this.physics.add.existing(shopZone, true);
    this.physics.add.overlap(this.player, shopZone, this.onEnterShop, undefined, this);

    // 5. HUD
    if(this.userData.gold === undefined) this.userData.gold = 0;
    const hudTextString = `${this.userData.username} [${this.userData.characterClass}] - Lvl: ${this.userData.level} | Exp: ${this.userData.exp} | Ouro: ${this.userData.gold} | HP: ${this.userData.hp}/${this.userData.maxHp}`;
    this.hudText = this.add.text(10, 10, hudTextString, {
        fontSize: '16px',
        fontFamily: 'Courier New',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: { x: 8, y: 8 }
    });
    this.hudText.setScrollFactor(0); // Faz o texto ignorar o movimento da câmera

    // 6. Retorno da Batalha
    this.events.on('resume', (_scene: any, data: any) => {
        if (data && data.result === 'win') {
            // Destrói o slime derrotado
            if (data.slime) {
                data.slime.destroy();
            }
        }
        
        // Atualiza o HUD
        this.userData = this.registry.get('user');
        const updatedText = `${this.userData.username} [${this.userData.characterClass}] - Lvl: ${this.userData.level} | Exp: ${this.userData.exp} | Ouro: ${this.userData.gold} | HP: ${this.userData.hp}/${this.userData.maxHp}`;
        this.hudText.setText(updatedText);

        // Empurra o jogador para baixo
        if (data && data.from === 'hospital') {
            this.player.y += 40;
        }
        if (data && data.from === 'shop') {
            this.player.y += 40;
        }

        // Despausa
        this.isBattling = false;
        this.physics.resume();
        if (this.player && this.player.body) {
            this.player.setVelocity(0);
        }
    });
  }

  private onMeetEnemy(_player: any, slime: any) {
    if (this.isBattling) return;
    this.isBattling = true;

    // Pausa a física e lança a cena de batalha por cima
    this.physics.pause();
    this.scene.pause();
    this.scene.launch('BattleScene', { 
        user: this.userData, 
        slime: slime,
        bgColor: '#2E8B57' // Cor verde escura para simular a grama
    });
  }

  private onEnterHospital() {
    if (this.isBattling) return;
    this.isBattling = true;

    // Pausa a física e entra no hospital
    this.physics.pause();
    this.scene.pause();
    this.scene.launch('HospitalScene', { 
        user: this.userData 
    });
  }

  private onEnterShop() {
    if (this.isBattling) return;
    this.isBattling = true;

    this.physics.pause();
    this.scene.pause();
    this.scene.launch('ShopScene', { 
        user: this.userData 
    });
  }

  update() {
    if (!this.cursors || !this.player || this.isBattling) return;

    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-160);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(160);
    }
  }
}
