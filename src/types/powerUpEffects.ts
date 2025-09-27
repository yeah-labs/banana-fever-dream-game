import { PowerUpType } from './gameEnums';

// Typed power-up effects instead of 'any'
export interface SpreadShotEffect {
  bulletCount: number;
  spreadAngle: number;
}

export interface ShieldEffect {
  damage: number;
  duration: number;
}

export interface ScoreDoublerEffect {
  multiplier: number;
  duration: number;
}

export interface MagnetEffect {
  radius: number;
  strength: number;
  duration: number;
}

export interface SwordEffect {
  damage: number;
  piercing: boolean;
  duration: number;
}

export interface RealityWarpEffect {
  stormIntensity: number;
  duration: number;
  timeDistortion: number;
}

export type PowerUpEffect = 
  | SpreadShotEffect
  | ShieldEffect
  | ScoreDoublerEffect
  | MagnetEffect
  | SwordEffect
  | RealityWarpEffect;

// Type guard functions
export const isPowerUpType = (type: string): type is PowerUpType => {
  return Object.values(PowerUpType).includes(type as PowerUpType);
};