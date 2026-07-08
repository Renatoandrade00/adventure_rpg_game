import * as Phaser from 'phaser';

export default class ShopScene extends Phaser.Scene {
  private userData: any;
  private npcMerchant!: Phaser.GameObjects.Image;
  private player!: Phaser.Physics.Arcade.Image;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private dialogText!: Phaser.GameObjects.Text;
  private exitZone!: Phaser.GameObjects.Zone;

  constructor() {
    super('ShopScene');
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
        } else if (y === 7 && x > 8 && x < 16) {
          row.push(7); // Balcão
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
        worldLayer.setCollision([6, 7]); // Parede e Balcão colidem
      }
    }

    // Título
    this.add.text(this.cameras.main.centerX, 40, 'LOJA DE ITENS', { fontSize: '28px', color: '#f1c40f', fontStyle: 'bold' }).setOrigin(0.5);
    
    // Tapete de Saída (Sul)
    this.add.rectangle(this.cameras.main.centerX, this.cameras.main.height - 20, 100, 40, 0x2c3e50);
    this.add.text(this.cameras.main.centerX, this.cameras.main.height - 20, 'SAÍDA', { fontSize: '16px', color: '#fff' }).setOrigin(0.5);
    this.exitZone = this.add.zone(this.cameras.main.centerX, this.cameras.main.height - 20, 100, 40);
    this.physics.add.existing(this.exitZone, true);

    // NPC Mercador
    this.npcMerchant = this.add.image(this.cameras.main.centerX, 200, 'npc_merchant').setDisplaySize(64, 64);
    this.add.text(this.cameras.main.centerX, 150, 'Mercador Bob', { fontSize: '16px', color: '#000', backgroundColor: '#fff', padding: {x: 4, y: 4} }).setOrigin(0.5);

    // Dialogo
    this.dialogText = this.add.text(this.cameras.main.centerX, 270, 'Olá! Pressione ESPAÇO perto de mim para comprar uma Poção por 10 Ouro.', { 
        fontSize: '16px', color: '#2c3e50', backgroundColor: '#ecf0f1', padding: {x: 10, y: 10}, align: 'center', wordWrap: { width: 400 }
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
    this.physics.add.overlap(this.player, this.exitZone, this.exitShop, undefined, this);
  }

  update() {
    if (!this.cursors || !this.player) return;

    this.player.setVelocity(0);

    if (this.cursors.left.isDown) this.player.setVelocityX(-160);
    else if (this.cursors.right.isDown) this.player.setVelocityX(160);

    if (this.cursors.up.isDown) this.player.setVelocityY(-160);
    else if (this.cursors.down.isDown) this.player.setVelocityY(160);

    // Distância para o mercador
    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.npcMerchant.x, this.npcMerchant.y);
    if (dist < 80 && Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
        this.buyPotion();
    }
  }

  private buyPotion() {
    if (this.userData.gold >= 10) {
        this.userData.gold -= 10;
        this.userData.potions = (this.userData.potions || 0) + 1;
        this.registry.set('user', this.userData);
        this.dialogText.setText(`Compra efetuada! Muito obrigado.\nOuro Restante: ${this.userData.gold} | Poções: ${this.userData.potions}`);
        this.dialogText.setStyle({ color: '#27ae60' });
    } else {
        this.dialogText.setText(`Você não tem Ouro suficiente!\n(Custa 10, você tem ${this.userData.gold})`);
        this.dialogText.setStyle({ color: '#e74c3c' });
    }
  }

  private exitShop() {
    this.scene.stop();
    this.scene.resume('GameScene', { from: 'shop' });
  }
}
