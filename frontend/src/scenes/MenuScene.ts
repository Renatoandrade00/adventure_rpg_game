import * as Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  private userData: any;
  private currentMapScene!: string;
  private currentX!: number;
  private currentY!: number;
  
  private logsText!: Phaser.GameObjects.Text;

  constructor() {
    super('MenuScene');
  }

  init(data: any) {
    this.userData = data.user;
    this.currentMapScene = data.currentMapScene || 'GameScene';
    this.currentX = data.x || 160;
    this.currentY = data.y || 160;
  }

  create() {
    // Fundo semitransparente
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8).setOrigin(0);

    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Título
    this.add.text(centerX, centerY - 150, 'MENU PRINCIPAL', { fontSize: '28px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

    // Painel de Status
    const statusText = `${this.userData.username} - Lvl: ${this.userData.level} | Ouro: ${this.userData.gold} | HP: ${this.userData.hp}/${this.userData.maxHp}`;
    this.add.text(centerX, centerY - 100, statusText, { fontSize: '18px', color: '#aaaaaa' }).setOrigin(0.5);

    // Botão de Usar Poção (Mochila)
    const btnPotion = this.add.text(centerX, centerY - 20, `Mochila: Usar Poção (${this.userData.potions}x)`, { 
        fontSize: '22px', color: '#fff', backgroundColor: '#e67e22', padding: { x: 15, y: 10 } 
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnPotion.on('pointerdown', () => {
        if (this.userData.potions > 0) {
            if (this.userData.hp < this.userData.maxHp) {
                this.userData.potions -= 1;
                this.userData.hp += 15;
                if (this.userData.hp > this.userData.maxHp) this.userData.hp = this.userData.maxHp;
                
                // Atualiza o registry
                this.registry.set('user', this.userData);
                
                // Atualiza textos
                btnPotion.setText(`Mochila: Usar Poção (${this.userData.potions}x)`);
                this.logsText.setText('Poção usada! +15 HP');
                this.logsText.setColor('#2ecc71');
            } else {
                this.logsText.setText('Sua vida já está cheia!');
                this.logsText.setColor('#ffff00');
            }
        } else {
            this.logsText.setText('Você não tem mais poções!');
            this.logsText.setColor('#e74c3c');
        }
    });

    // Botão de Salvar Jogo
    const btnSave = this.add.text(centerX, centerY + 50, 'Salvar Jogo na Nuvem', { 
        fontSize: '22px', color: '#fff', backgroundColor: '#3498db', padding: { x: 15, y: 10 } 
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnSave.on('pointerdown', async () => {
        btnSave.setText('Salvando...');
        btnSave.disableInteractive();
        
        try {
            // URL do backend (tentamos puxar do env, se não localhost)
            const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3000/api';
            const res = await fetch(`${API_URL}/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.userData.username,
                    level: this.userData.level,
                    exp: this.userData.exp,
                    gold: this.userData.gold,
                    potions: this.userData.potions,
                    hp: this.userData.hp,
                    maxHp: this.userData.maxHp,
                    currentScene: this.currentMapScene,
                    lastX: this.currentX,
                    lastY: this.currentY
                })
            });

            if (res.ok) {
                this.logsText.setText('Jogo salvo com sucesso!');
                this.logsText.setColor('#3498db');
            } else {
                this.logsText.setText('Erro ao salvar no servidor.');
                this.logsText.setColor('#e74c3c');
            }
        } catch (e) {
            console.error(e);
            this.logsText.setText('Falha de conexão com o servidor.');
            this.logsText.setColor('#e74c3c');
        }
        
        btnSave.setText('Salvar Jogo na Nuvem');
        btnSave.setInteractive({ useHandCursor: true });
    });

    // Botão Voltar (Fechar Menu)
    const btnClose = this.add.text(centerX, centerY + 120, 'Voltar ao Jogo', { 
        fontSize: '20px', color: '#fff', backgroundColor: '#95a5a6', padding: { x: 15, y: 10 } 
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnClose.on('pointerdown', () => {
        // Despausa a cena de mapa que estava pausada e passa os novos dados atualizados
        if (this.scene.manager.isPaused(this.currentMapScene)) {
            this.scene.resume(this.currentMapScene, { menuUpdate: true });
        }
        this.scene.stop();
    });

    // Log feedback
    this.logsText = this.add.text(centerX, centerY + 200, '', { fontSize: '18px', color: '#fff' }).setOrigin(0.5);

    // Permitir fechar o menu no ESC ou ENTER também
    if (this.input.keyboard) {
        // Retirando o listener direto do ENTER para não conflitar caso o usuário segure o botão, mas o ESC é seguro.
        this.input.keyboard.on('keydown-ESC', () => btnClose.emit('pointerdown'));
    }
  }
}
