import * as Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Mantemos os blocos do mapa gerados via código por enquanto
    const graphics = this.add.graphics();
    
    // Tile 0: Grama (Textura melhorada)
    graphics.fillStyle(0x4CAF50, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.fillStyle(0x388E3C, 1);
    graphics.fillRect(4, 4, 2, 2);
    graphics.fillRect(20, 16, 2, 2);
    graphics.fillRect(10, 26, 2, 2);
    graphics.fillStyle(0x81C784, 1);
    graphics.fillRect(24, 8, 2, 2);
    graphics.fillRect(8, 18, 2, 2);
    
    // Tile 1: Parede
    graphics.fillStyle(0x757575, 1);
    graphics.fillRect(32, 0, 32, 32);
    graphics.lineStyle(2, 0x424242, 1);
    graphics.strokeRect(32, 0, 32, 32);
    
    // Tile 2: Árvore (Estilo mais arredondado e clássico)
    graphics.fillStyle(0x4CAF50, 1);
    graphics.fillRect(64, 0, 32, 32); // Fundo de grama
    graphics.fillStyle(0x5D4037, 1); // Tronco
    graphics.fillRect(64 + 14, 16, 4, 16);
    graphics.fillStyle(0x1B5E20, 1); // Sombra das folhas
    graphics.fillCircle(64 + 16, 12, 12);
    graphics.fillStyle(0x2E7D32, 1); // Folhas claras
    graphics.fillCircle(64 + 16, 10, 10);
    
    // Tile 3: Pedra / Parede de Caverna (Cinza escuro, formato irregular)
    graphics.fillStyle(0x3E2723, 1); // Fundo marrom escuro (chão de caverna)
    graphics.fillRect(96, 0, 32, 32);
    graphics.fillStyle(0x616161, 1); // Pedra
    graphics.fillCircle(96 + 16, 16, 12);
    graphics.fillCircle(96 + 10, 20, 8);
    graphics.fillCircle(96 + 22, 22, 6);

    // Tile 4: Chão de Caverna
    graphics.fillStyle(0x3E2723, 1);
    graphics.fillRect(128, 0, 32, 32);
    graphics.fillStyle(0x271613, 1); // Detalhes
    graphics.fillRect(128 + 6, 6, 4, 4);
    graphics.fillRect(128 + 22, 18, 4, 4);

    // Tile 5: Chão de Madeira (Interior)
    graphics.fillStyle(0x8D6E63, 1);
    graphics.fillRect(160, 0, 32, 32);
    graphics.lineStyle(1, 0x5D4037, 1);
    graphics.beginPath();
    graphics.moveTo(160, 8); graphics.lineTo(192, 8);
    graphics.moveTo(160, 16); graphics.lineTo(192, 16);
    graphics.moveTo(160, 24); graphics.lineTo(192, 24);
    graphics.strokePath();

    // Tile 6: Parede de Tijolos (Interior)
    graphics.fillStyle(0xB71C1C, 1); // Vermelho tijolo
    graphics.fillRect(192, 0, 32, 32);
    graphics.lineStyle(2, 0xffffff, 0.5); // Linhas brancas de cimento
    graphics.beginPath();
    graphics.moveTo(192, 10); graphics.lineTo(224, 10);
    graphics.moveTo(192, 22); graphics.lineTo(224, 22);
    graphics.moveTo(208, 0); graphics.lineTo(208, 10);
    graphics.moveTo(200, 10); graphics.lineTo(200, 22);
    graphics.moveTo(216, 22); graphics.lineTo(216, 32);
    graphics.strokePath();

    // Tile 7: Balcão de Loja
    graphics.fillStyle(0x795548, 1);
    graphics.fillRect(224, 0, 32, 32);
    graphics.fillStyle(0x5D4037, 1);
    graphics.fillRect(224, 10, 32, 12); // Tampo
    
    // Tile 8: Cama de Hospital
    graphics.fillStyle(0xEEEEEE, 1); // Lençol branco
    graphics.fillRect(256, 0, 32, 32);
    graphics.fillStyle(0x64B5F6, 1); // Travesseiro azul claro
    graphics.fillRect(256 + 4, 4, 24, 8);
    graphics.fillStyle(0xFF5252, 1); // Cruz vermelha minúscula
    graphics.fillRect(256 + 14, 18, 4, 10);
    graphics.fillRect(256 + 11, 21, 10, 4);

    // Tile 9: Caminho de Terra
    graphics.fillStyle(0x8D6E63, 1); // Terra
    graphics.fillRect(288, 0, 32, 32);
    graphics.fillStyle(0x6D4C41, 1); // Detalhes
    graphics.fillRect(288 + 4, 4, 4, 2);
    graphics.fillRect(288 + 20, 12, 2, 4);
    graphics.fillRect(288 + 10, 24, 4, 2);

    // Tile 10: Água (Rio)
    graphics.fillStyle(0x2196F3, 1); // Água azul
    graphics.fillRect(320, 0, 32, 32);
    graphics.fillStyle(0x64B5F6, 1); // Reflexo claro
    graphics.fillRect(320 + 8, 8, 12, 2);
    graphics.fillRect(320 + 4, 20, 8, 2);
    graphics.fillRect(320 + 20, 24, 6, 2);

    // Tile 11: Ponte de Madeira
    graphics.fillStyle(0x795548, 1); // Fundo madeira
    graphics.fillRect(352, 0, 32, 32);
    graphics.lineStyle(2, 0x3E2723, 1); // Vãos
    graphics.beginPath();
    graphics.moveTo(352 + 8, 0); graphics.lineTo(352 + 8, 32);
    graphics.moveTo(352 + 16, 0); graphics.lineTo(352 + 16, 32);
    graphics.moveTo(352 + 24, 0); graphics.lineTo(352 + 24, 32);
    graphics.strokePath();
    graphics.fillStyle(0x000000, 0.3); // Pregos
    graphics.fillRect(352 + 4, 2, 2, 2);
    graphics.fillRect(352 + 12, 2, 2, 2);
    graphics.fillRect(352 + 20, 2, 2, 2);
    graphics.fillRect(352 + 28, 2, 2, 2);
    graphics.fillRect(352 + 4, 28, 2, 2);
    graphics.fillRect(352 + 12, 28, 2, 2);
    graphics.fillRect(352 + 20, 28, 2, 2);
    graphics.fillRect(352 + 28, 28, 2, 2);

    graphics.generateTexture('tiles', 384, 32);
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
    const userData = this.registry.get('user');
    const targetScene = userData?.currentScene || 'GameScene';
    const targetX = userData?.lastX || 160;
    const targetY = userData?.lastY || 160;
    this.scene.start(targetScene, { x: targetX, y: targetY });
  }
}
