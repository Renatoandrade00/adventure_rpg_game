import * as Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import GameScene from './scenes/GameScene';
import BattleScene from './scenes/BattleScene';
import HospitalScene from './scenes/HospitalScene';
import ShopScene from './scenes/ShopScene';
import MapEastScene from './scenes/MapEastScene';
import MapSouthScene from './scenes/MapSouthScene';
import MapWestScene from './scenes/MapWestScene';
import MapNorthScene from './scenes/MapNorthScene';
import DungeonScene from './scenes/DungeonScene';

import MenuScene from './scenes/MenuScene';

// URL do Backend (pega das variáveis de ambiente em produção, senão usa localhost)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Extend window to store game instance
declare global {
  interface Window {
    __PHASER_GAME__: Phaser.Game | null;
  }
}

// Variável global para armazenar a instância do jogo
let game: Phaser.Game | null = null;

// Função para iniciar o jogo (chamada após o login)
function startGame(userData: any) {
  // Esconde o Overlay de Auth
  const authOverlay = document.getElementById('auth-overlay');
  if (authOverlay) authOverlay.style.display = 'none';

  // Configuração do Phaser
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'app',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false
      }
    },
    // MenuScene e BattleScene ficam no final para renderizar por cima de tudo
    scene: [BootScene, GameScene, HospitalScene, ShopScene, MapEastScene, MapSouthScene, MapWestScene, MapNorthScene, DungeonScene, MenuScene, BattleScene]
  };

  // Destrói qualquer instância anterior para evitar duplicação de Canvas (útil em HMR e double-clicks)
  if (window.__PHASER_GAME__) {
    window.__PHASER_GAME__.destroy(true);
  }

  // Inicia o Jogo
  game = new Phaser.Game(config);
  window.__PHASER_GAME__ = game;

  // Assim que o jogo iniciar, passamos os dados do usuário para o Registry (Memória Global do Jogo)
  game.registry.set('user', userData);
  
  console.log(`Herói ${userData.username} (Classe: ${userData.characterClass}, Lvl: ${userData.level}) entrou no mundo!`);
}

// -------------------------------------------------------------
// Lógica da Interface HTML (DOM)
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form') as HTMLFormElement;
  const registerForm = document.getElementById('register-form') as HTMLFormElement;
  const showRegisterLink = document.getElementById('show-register');
  const showLoginLink = document.getElementById('show-login');
  
  const loginError = document.getElementById('login-error');
  const regError = document.getElementById('reg-error');

  // Alternar entre Login e Cadastro
  showRegisterLink?.addEventListener('click', () => {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    if(loginError) loginError.textContent = '';
  });

  showLoginLink?.addEventListener('click', () => {
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    if(regError) regError.textContent = '';
  });

  // Enviar Login
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = (document.getElementById('login-username') as HTMLInputElement).value;
    const password = (document.getElementById('login-password') as HTMLInputElement).value;
    
    if(loginError) loginError.textContent = 'Autenticando...';

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Sucesso! Inicia o jogo com os dados
        startGame(data.user);
      } else {
        if(loginError) loginError.textContent = data.error || 'Erro no login.';
      }
    } catch (err) {
      if(loginError) loginError.textContent = 'Erro ao conectar no servidor.';
    }
  });

  // Enviar Cadastro
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = (document.getElementById('reg-username') as HTMLInputElement).value;
    const password = (document.getElementById('reg-password') as HTMLInputElement).value;
    const characterClass = (document.getElementById('reg-class') as HTMLSelectElement).value;
    
    if(regError) regError.textContent = 'Criando herói...';

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, characterClass })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Sucesso no cadastro! Volta para o login ou entra direto (aqui vamos entrar direto)
        startGame(data.user);
      } else {
        if(regError) regError.textContent = data.error || 'Erro ao criar conta.';
      }
    } catch (err) {
      if(regError) regError.textContent = 'Erro ao conectar no servidor.';
    }
  });
});
