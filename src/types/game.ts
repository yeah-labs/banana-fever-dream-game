import { GameStatus, PowerUpType, PowerUpRarity, EnemyType, EnemyPattern, BulletType } from './gameEnums';
import { PowerUpEffect } from './powerUpEffects';

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface GameObject {
  id: string;
  position: Position;
  velocity: Velocity;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
}

export interface Player extends GameObject {
  score: number;
  feverMeter: number;
  powerUps: PowerUp[];
  invulnerable: boolean;
  invulnerabilityTime: number;
}

export interface Enemy extends GameObject {
  type: EnemyType;
  points: number;
  pattern: EnemyPattern;
  lastShot: number;
  hoverStartTime?: number;
  isHovering?: boolean;
  damageWhenStartedHovering?: number;
  hoverThreshold?: number;
  hoverPhase?: number;
  hoverThresholds?: number[];
  phaseStartTime?: number;
}

export interface Bullet extends GameObject {
  damage: number;
  isPlayerBullet: boolean;
  type: BulletType;
}

export interface PowerUp extends GameObject {
  type: PowerUpType;
  rarity: PowerUpRarity;
  duration: number;
  effect: PowerUpEffect;
}

export interface GameState {
  status: GameStatus;
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  powerUps: PowerUp[];
  level: number;
  wave: number;
  waveProgress: number;
  totalWaves: number;
  lastEnemySpawn: number;
  gameTime: number;
  secretMode: boolean;
  shakeIntensity: number;
  lastFrame: number;
  feversUsed: number;
  realityStormActive: boolean;
  realityStormEndTime: number;
  realityStormIntensity: number;
}

export interface GameConfig {
  canvas: {
    width: number;
    height: number;
  };
  player: {
    speed: number;
    bulletSpeed: number;
    fireRate: number;
    maxHealth: number;
  };
  enemy: {
    speed: number;
    bulletSpeed: number;
    spawnRate: number;
  };
  powerUp: {
    dropRate: number;
    magnetRadius: number;
  };
  fever: {
    buildRate: number;
    damageMultiplier: {
      NORMAL: number;
      MINI_BOSS: number;
      BOSS: number;
    };
  };
}

export interface HighScore {
  score: number;
  level: number;
  waves: number;
  timestamp: number;
  playerName?: string;
}