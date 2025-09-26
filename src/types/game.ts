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
  type: 'normal' | 'mini-boss' | 'boss' | 'easter-egg';
  points: number;
  pattern: 'zigzag' | 'straight' | 'shielded' | 'splitter';
  lastShot: number;
  hoverStartTime?: number;
  isHovering?: boolean;
  damageWhenStartedHovering?: number;
  hoverThreshold?: number;
}

export interface Bullet extends GameObject {
  damage: number;
  isPlayerBullet: boolean;
  type: 'normal' | 'banana' | 'sword';
}

export interface PowerUp extends GameObject {
  type: 'spread-shot' | 'shield' | 'score-doubler' | 'magnet' | 'sword' | 'reality-warp';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  duration: number;
  effect: any;
}

export interface GameState {
  status: 'ready' | 'playing' | 'paused' | 'game-over';
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
      normal: number;
      miniBoss: number;
      boss: number;
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