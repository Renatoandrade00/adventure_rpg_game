import * as Phaser from 'phaser';

const SKILLS: Record<string, any[]> = {
    Guerreiro: [
        { name: "Golpe Rápido", minLvl: 1, dmgMin: 5, dmgMax: 10 },
        { name: "Corte Profundo", minLvl: 2, dmgMin: 8, dmgMax: 15 },
        { name: "Investida", minLvl: 3, dmgMin: 12, dmgMax: 20 },
        { name: "Lâmina Furiosa", minLvl: 4, dmgMin: 20, dmgMax: 30 }
    ],
    Arqueiro: [
        { name: "Tiro Rápido", minLvl: 1, dmgMin: 4, dmgMax: 12 },
        { name: "Flecha Venenosa", minLvl: 2, dmgMin: 6, dmgMax: 18 },
        { name: "Chuva de Prata", minLvl: 3, dmgMin: 10, dmgMax: 25 },
        { name: "Tiro Certeiro", minLvl: 4, dmgMin: 15, dmgMax: 35 }
    ],
    "Mágico": [
        { name: "Raio Mágico", minLvl: 1, dmgMin: 2, dmgMax: 15 },
        { name: "Bola de Fogo", minLvl: 2, dmgMin: 5, dmgMax: 25 },
        { name: "Nevasca", minLvl: 3, dmgMin: 8, dmgMax: 30 },
        { name: "Explosão Arcana", minLvl: 4, dmgMin: 10, dmgMax: 45 }
    ]
};

export default class BattleScene extends Phaser.Scene {
  private userData: any;
  private slimeData: any;
  private bgColor: string = '#000000';
  private logsText!: Phaser.GameObjects.Text;
  
  private playerHP: number = 0;
  private playerMaxHP: number = 0;
  private enemyHP: number = 15;
  private enemyMaxHP: number = 15;

  private playerHPText!: Phaser.GameObjects.Text;
  private enemyHPText!: Phaser.GameObjects.Text;

  private actionButtons: Phaser.GameObjects.Text[] = [];
  private isPlayerTurn: boolean = true;

  constructor() {
    super('BattleScene');
  }

  init(data: any) {
    this.userData = data.user;
    this.slimeData = data.slime;
    this.bgColor = data.bgColor || '#000000';
    
    // Se não tiver hp salvo (contas velhas), define o padrão.
    if (this.userData.hp === undefined) {
        this.userData.maxHp = 20 + (this.userData.level * 5);
        this.userData.hp = this.userData.maxHp;
    }

    this.playerMaxHP = this.userData.maxHp;
    this.playerHP = this.userData.hp;

    this.enemyMaxHP = 15 + (Math.floor(Math.random() * this.userData.level * 2));
    this.enemyHP = this.enemyMaxHP;
    this.isPlayerTurn = true;
    this.actionButtons = [];
  }

  create() {
    this.cameras.main.setBackgroundColor(this.bgColor);

    this.add.text(this.cameras.main.centerX, 40, 'BATALHA!', { fontSize: '28px', color: '#ff0000', fontStyle: 'bold' }).setOrigin(0.5);

    // Jogador (Esquerda)
    const playerX = this.cameras.main.width * 0.25;
    const playerY = this.cameras.main.centerY - 50;
    this.add.image(playerX, playerY, `class_${this.userData.characterClass}`).setDisplaySize(128, 128);
    this.add.text(playerX, playerY + 80, this.userData.username, { fontSize: '20px', color: '#fff' }).setOrigin(0.5);
    this.playerHPText = this.add.text(playerX, playerY + 110, `HP: ${this.playerHP}/${this.playerMaxHP}`, { fontSize: '18px', color: '#2ecc71' }).setOrigin(0.5);

    // Inimigo (Direita)
    const enemyX = this.cameras.main.width * 0.75;
    const enemyY = this.cameras.main.centerY - 50;
    this.add.image(enemyX, enemyY, 'enemy_slime').setDisplaySize(128, 128);
    this.add.text(enemyX, enemyY + 80, 'Slime Selvagem', { fontSize: '20px', color: '#fff' }).setOrigin(0.5);
    this.enemyHPText = this.add.text(enemyX, enemyY + 110, `HP: ${this.enemyHP}/${this.enemyMaxHP}`, { fontSize: '18px', color: '#e74c3c' }).setOrigin(0.5);

    // Log (Centro)
    this.logsText = this.add.text(this.cameras.main.centerX, this.cameras.main.height - 180, 'Um Slime selvagem apareceu!\nO que você vai fazer?', {
      fontSize: '18px', color: '#ffff00', align: 'center'
    }).setOrigin(0.5);

    this.createActionMenu();
  }

  private createActionMenu() {
    const startY = this.cameras.main.height - 100;
    const skills = SKILLS[this.userData.characterClass] || SKILLS['Guerreiro'];
    
    // Lista os 4 ataques possíveis
    for (let i = 0; i < 4; i++) {
        const skill = skills[i];
        const xPos = i % 2 === 0 ? this.cameras.main.centerX - 150 : this.cameras.main.centerX + 150;
        const yPos = i < 2 ? startY : startY + 50;

        let btnText = `Bloqueado (Lvl ${skill.minLvl})`;
        let isLocked = true;
        let color = '#7f8c8d'; // Cinza

        if (this.userData.level >= skill.minLvl) {
            btnText = skill.name;
            isLocked = false;
            color = '#3498db'; // Azul
        }

        const btn = this.add.text(xPos, yPos, btnText, {
            fontSize: '18px',
            color: '#fff',
            backgroundColor: color,
            padding: { x: 10, y: 5 },
            fixedWidth: 250,
            align: 'center'
        }).setOrigin(0.5);

        if (!isLocked) {
            btn.setInteractive({ useHandCursor: true });
            btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#2980b9' }));
            btn.on('pointerout', () => btn.setStyle({ backgroundColor: color }));
            btn.on('pointerdown', () => this.playerAttack(skill));
        }
        this.actionButtons.push(btn);
    }

    // Botão Poção
    const potionBtn = this.add.text(120, startY + 25, `Poção (${this.userData.potions}x)`, {
        fontSize: '18px', color: '#fff', backgroundColor: '#e67e22', padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    potionBtn.on('pointerdown', () => this.usePotion());
    this.actionButtons.push(potionBtn);

    // Botão Fugir
    const runBtn = this.add.text(this.cameras.main.width - 120, startY + 25, 'Fugir', {
        fontSize: '18px', color: '#fff', backgroundColor: '#95a5a6', padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    runBtn.on('pointerdown', () => this.flee());
    this.actionButtons.push(runBtn);
  }

  private disableButtons() {
    this.actionButtons.forEach(btn => {
        if(btn.input) {
            btn.disableInteractive();
            btn.setAlpha(0.5);
        }
    });
  }

  private enableButtons() {
    this.actionButtons.forEach(btn => {
        if(btn.input) {
            btn.setInteractive();
            btn.setAlpha(1);
        }
    });
  }

  private updateHUD() {
    this.playerHPText.setText(`HP: ${this.playerHP}/${this.playerMaxHP}`);
    this.enemyHPText.setText(`HP: ${this.enemyHP}/${this.enemyMaxHP}`);
  }

  private usePotion() {
    if (!this.isPlayerTurn) return;
    
    if (this.userData.potions <= 0) {
        this.logsText.setText("Você não tem mais poções!");
        return;
    }

    this.disableButtons();
    this.userData.potions -= 1;
    this.playerHP += 15;
    if (this.playerHP > this.playerMaxHP) this.playerHP = this.playerMaxHP;
    
    // Atualiza o texto do botão
    this.actionButtons[4].setText(`Poção (${this.userData.potions}x)`);

    this.logsText.setText("Você usou uma Poção e recuperou 15 HP!");
    this.updateHUD();

    this.isPlayerTurn = false;
    this.time.delayedCall(1500, () => this.enemyAttack(), [], this);
  }

  private playerAttack(skill: any) {
    if (!this.isPlayerTurn) return;
    this.disableButtons();

    // Dano base + bônus do Level
    const damage = Phaser.Math.Between(skill.dmgMin, skill.dmgMax) + this.userData.level;
    this.enemyHP -= damage;
    if (this.enemyHP < 0) this.enemyHP = 0;

    this.logsText.setText(`Você usou ${skill.name} e causou ${damage} de dano!`);
    this.updateHUD();

    if (this.enemyHP <= 0) {
      this.winBattle();
    } else {
      this.isPlayerTurn = false;
      this.time.delayedCall(1500, () => this.enemyAttack(), [], this);
    }
  }

  private enemyAttack() {
    const damage = Phaser.Math.Between(2, 5);
    this.playerHP -= damage;
    if (this.playerHP < 0) this.playerHP = 0;

    this.logsText.setText(`O Slime revidou e causou ${damage} de dano!`);
    this.updateHUD();

    if (this.playerHP <= 0) {
      this.loseBattle();
    } else {
      this.isPlayerTurn = true;
      this.enableButtons();
    }
  }

  private winBattle() {
    this.userData.hp = this.playerHP; // Salva a vida restante
    const expGained = 5;
    const goldGained = Phaser.Math.Between(3, 8);
    
    this.userData.exp += expGained;
    if(this.userData.gold === undefined) this.userData.gold = 0;
    this.userData.gold += goldGained;
    
    const expNeeded = this.userData.level * 10;
    
    if (this.userData.exp >= expNeeded) {
        this.userData.level += 1;
        this.userData.exp -= expNeeded; 
        
        // Aumenta vida máxima e cura 100%
        this.userData.maxHp = 20 + (this.userData.level * 5);
        this.userData.hp = this.userData.maxHp;

        this.logsText.setText(`Vitória!\nGanhou ${expGained} Exp e ${goldGained} Ouro.\nPARABÉNS! Você subiu para o Nível ${this.userData.level}!`);
    } else {
        this.logsText.setText(`Vitória!\nGanhou ${expGained} Exp e ${goldGained} Ouro. (${this.userData.exp}/${expNeeded})`);
    }

    this.registry.set('user', this.userData);

    this.time.delayedCall(3000, () => {
      this.scene.stop();
      this.scene.resume('GameScene', { result: 'win', slime: this.slimeData });
    });
  }

  private loseBattle() {
    this.userData.hp = 1; // Fica com 1 de HP se perder
    this.logsText.setText(`Você desmaiou... \n(Fugiu para o hospital)`);
    this.time.delayedCall(3000, () => {
      this.scene.stop();
      this.scene.resume('GameScene', { result: 'flee' });
    });
  }

  private flee() {
    if (!this.isPlayerTurn) return;
    this.disableButtons();
    
    if (Math.random() > 0.3) {
        this.userData.hp = this.playerHP; // Salva a vida
        this.logsText.setText("Você fugiu com sucesso!");
        this.time.delayedCall(1500, () => {
            this.scene.stop();
            this.scene.resume('GameScene', { result: 'flee' });
        });
    } else {
        this.logsText.setText("Você tentou fugir, mas tropeçou!");
        this.isPlayerTurn = false;
        this.time.delayedCall(1500, () => this.enemyAttack(), [], this);
    }
  }
}
