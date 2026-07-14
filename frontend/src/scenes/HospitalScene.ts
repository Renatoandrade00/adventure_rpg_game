import * as Phaser from 'phaser';

export default class HospitalScene extends Phaser.Scene {
  private userData: any;
  private npcNurse!: Phaser.GameObjects.Image;
  private player!: Phaser.Physics.Arcade.Image;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private dialogText!: Phaser.GameObjects.Text;
  private exitZone!: Phaser.GameObjects.Zone;

  constructor() {
    super('HospitalScene');
  }

  init(data: any) {
    this.userData = data.user;
  }

  create() {
    // Criação do Mapa Interior
    const level = [];
    for (let y = 0; y < 19; y++) {
      const row = [];
      for (let x = 0; x < 25; x++) {
        if (y === 0 || y === 18 || x === 0 || x === 24) {
          row.push(6); // Parede Tijolo
        } else if (y === 2 && x > 2 && x < 22 && x % 4 === 0) {
          row.push(8); // Cama de Hospital
        } else {
          row.push(5); // Chão Madeira
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
        worldLayer.setCollision([6, 8]); // Parede e Camas colidem
      }
    }

    // Título
    this.add.text(this.cameras.main.centerX, 40, 'HOSPITAL CENTRAL', { fontSize: '28px', color: '#e74c3c', fontStyle: 'bold' }).setOrigin(0.5);
    
    // Tapete de Saída (Sul)
    this.add.rectangle(this.cameras.main.centerX, this.cameras.main.height - 20, 100, 40, 0x34495e);
    this.add.text(this.cameras.main.centerX, this.cameras.main.height - 20, 'SAÍDA', { fontSize: '16px', color: '#fff' }).setOrigin(0.5);
    this.exitZone = this.add.zone(this.cameras.main.centerX, this.cameras.main.height - 20, 100, 40);
    this.physics.add.existing(this.exitZone, true);

    // NPC Enfermeira
    this.npcNurse = this.add.image(this.cameras.main.centerX, 200, 'npc_nurse').setDisplaySize(64, 64);
    this.add.text(this.cameras.main.centerX, 150, 'Enfermeira Joy', { fontSize: '16px', color: '#000', backgroundColor: '#fff', padding: {x: 4, y: 4} }).setOrigin(0.5);

    // Dialogo
    this.dialogText = this.add.text(this.cameras.main.centerX, 270, 'Olá! Pressione ESPAÇO perto de mim para curar.', { 
        fontSize: '18px', color: '#2c3e50', backgroundColor: '#ecf0f1', padding: {x: 10, y: 10}, align: 'center'
    }).setOrigin(0.5);

    // Player
    const textureName = `class_${this.userData.characterClass}`;
    this.player = this.physics.add.image(this.cameras.main.centerX, this.cameras.main.height - 100, textureName);
    this.player.setDisplaySize(64, 64);
    this.player.setCollideWorldBounds(true);

    if (this.input.keyboard) {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    if (worldLayer) {
        this.physics.add.collider(this.player, worldLayer);
    }

    // Colisão Saída
    this.physics.add.overlap(this.player, this.exitZone, this.exitHospital, undefined, this);
  }

  update() {
    if (!this.cursors || !this.player) return;

    this.player.setVelocity(0);

    if (this.cursors.left.isDown) this.player.setVelocityX(-160);
    else if (this.cursors.right.isDown) this.player.setVelocityX(160);

    if (this.cursors.up.isDown) this.player.setVelocityY(-160);
    else if (this.cursors.down.isDown) this.player.setVelocityY(160);

    // Distância para a enfermeira
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.npcNurse.x, this.npcNurse.y);
    if (dist < 80 && Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
        this.healPlayer();
    }
  }

  private healPlayer() {
    this.userData.hp = this.userData.maxHp;

    // Restaura PP
    if (this.userData.skillsPP) {
        const maxPPMap: Record<string, number> = { 
            "Golpe Rápido": 40, "Corte Profundo": 25, "Investida": 15, "Lâmina Furiosa": 5, 
            "Tiro Rápido": 40, "Flecha Venenosa": 25, "Chuva de Prata": 15, "Tiro Certeiro": 5, 
            "Raio Mágico": 40, "Bola de Fogo": 25, "Nevasca": 15, "Explosão Arcana": 5 
        };
        for (const skillName in this.userData.skillsPP) {
            if (maxPPMap[skillName] !== undefined) {
                this.userData.skillsPP[skillName] = maxPPMap[skillName];
            }
        }
    }

    this.registry.set('user', this.userData); // Atualiza memória global
    this.dialogText.setText('Prontinho! Seu HP e PP foram totalmente restaurados.\nVolte sempre!');
    this.dialogText.setStyle({ color: '#27ae60' });
  }

  private exitHospital() {
    this.scene.stop();
    this.scene.resume('GameScene', { from: 'hospital' });
  }
}
