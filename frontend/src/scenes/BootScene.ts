import * as Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Mantemos os blocos do mapa gerados via código por enquanto
    const graphics = this.add.graphics();
    
    // Tile 0: Grama
    graphics.fillStyle(0x4CAF50, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.fillStyle(0x388E3C, 1);
    graphics.fillRect(4, 4, 4, 4);
    graphics.fillRect(20, 16, 4, 4);
    
    // Tile 1: Parede
    graphics.fillStyle(0x757575, 1);
    graphics.fillRect(32, 0, 32, 32);
    graphics.lineStyle(2, 0x424242, 1);
    graphics.strokeRect(32, 0, 32, 32);
    
    graphics.generateTexture('tiles', 64, 32);
    graphics.destroy();

    // ==========================================
    // Carregar Imagens Reais (Geradas por IA)
    // ==========================================
    this.load.image('class_Guerreiro', 'assets/warrior.png');
    this.load.image('class_Arqueiro', 'assets/archer.png');
    this.load.image('class_Mágico', 'assets/mage.png');

    this.load.image('enemy_slime', '/assets/slime.png');
    this.load.image('enemy_goblin', '/assets/enemy_goblin.png');
    this.load.image('enemy_wolf', '/assets/enemy_wolf.png');
    this.load.image('enemy_bat', '/assets/enemy_bat.png');
    this.load.image('enemy_skeleton', '/assets/enemy_skeleton.png');
    this.load.image('enemy_orc', '/assets/enemy_orc.png');
    this.load.image('enemy_spider', '/assets/enemy_spider.png');
    this.load.image('enemy_wraith', '/assets/enemy_wraith.png');
    this.load.image('enemy_golem', '/assets/enemy_golem.png');
    this.load.image('enemy_minotaur', '/assets/enemy_minotaur.png');
    this.load.image('npc_nurse', 'assets/nurse.png');
    this.load.image('npc_merchant', 'assets/merchant.png');
    
    this.load.image('hospital_building', 'assets/hospital_building.png');
    this.load.image('shop_building', 'assets/shop_building.png');
  }

  create() {
    this.scene.start('GameScene');
  }
}
