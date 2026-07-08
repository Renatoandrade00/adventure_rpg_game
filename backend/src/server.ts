import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import crypto from 'crypto';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// MODO MONGODB ATLAS (PRODUÇÃO)
// ==========================================
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rpg_game';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Conectado ao MongoDB Atlas!'))
  .catch(err => console.error('❌ Erro ao conectar ao MongoDB:', err));

const hashPassword = (password: string) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

app.post('/api/register', async (req, res) => {
  try {
    const { username, password, characterClass } = req.body;

    if (!username || !password || !characterClass) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Nome de usuário já existe' });
    }

    const newUser = new User({
      username,
      passwordHash: hashPassword(password),
      characterClass,
      level: 1,
      exp: 0,
      gold: 0,
      potions: 2,
      hp: 25,
      maxHp: 25
    });

    await newUser.save();
    console.log('✅ Novo herói criado no Banco de Dados:', username);
    
    res.status(201).json({ message: 'Conta criada com sucesso!', user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username, passwordHash: hashPassword(password) });
    if (!user) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    console.log('✅ Herói fez login:', username);

    res.json({
      message: 'Login bem sucedido',
      user: {
        username: user.username,
        characterClass: user.characterClass,
        level: user.level,
        exp: user.exp,
        gold: user.gold,
        potions: user.potions,
        hp: user.hp,
        maxHp: user.maxHp
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Endpoint de atualização (save) - Opcional, para o frontend mandar o progresso de volta pro DB
app.post('/api/save', async (req, res) => {
    try {
      const { username, level, exp, gold, potions, hp, maxHp } = req.body;
      const user = await User.findOneAndUpdate(
          { username }, 
          { level, exp, gold, potions, hp, maxHp }, 
          { new: true }
      );
      if (!user) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      res.json({ message: 'Progresso salvo!', user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao salvar' });
    }
});

app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
