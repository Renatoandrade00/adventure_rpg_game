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
    this.cameras.main.setBackgroundColor('#cccccc'); // Chão do hospital (cinza claro)

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
    this.registry.set('user', this.userData); // Atualiza memória global
    this.dialogText.setText('Prontinho! Seu HP foi totalmente restaurado.\nVolte sempre!');
    this.dialogText.setStyle({ color: '#27ae60' });
  }

  private exitHospital() {
    this.scene.stop();
    this.scene.resume('GameScene', { from: 'hospital' });
  }
}
