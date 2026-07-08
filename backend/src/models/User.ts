import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  passwordHash: string;
  characterClass: 'Guerreiro' | 'Arqueiro' | 'Mágico';
  level: number;
  exp: number;
  gold: number;
  potions: number;
  hp: number;
  maxHp: number;
  currentScene: string;
  lastX: number;
  lastY: number;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  characterClass: { 
    type: String, 
    required: true, 
    enum: ['Guerreiro', 'Arqueiro', 'Mágico'] 
  },
  level: { type: Number, default: 1 },
  exp: { type: Number, default: 0 },
  gold: { type: Number, default: 0 },
  potions: { type: Number, default: 2 },
  hp: { type: Number, default: 25 },
  maxHp: { type: Number, default: 25 },
  currentScene: { type: String, default: 'GameScene' },
  lastX: { type: Number, default: 160 },
  lastY: { type: Number, default: 160 }
});

export default mongoose.model<IUser>('User', UserSchema);
